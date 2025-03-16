import { handleRequest } from '@/lib/api';
import { toQueryString } from '@/lib/utils';
import pako from "pako";
import { createContext, useContext } from 'react';
import { useStore as _useStore, create, StoreApi } from 'zustand';
import { Channel, ChatStatus, DataStore, Message, MeUser, Presence, RelationID, Relationship, User, UserID } from './store';

import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

enableMapSet();

export type Store = ReturnType<typeof createStore>;

function deflatePayload(data: Uint8Array) {
  return pako.inflate(data, { to: "string" })
}


function setupChannelList(channels: Record<string, Channel>, store: StoreApi<DataStore>) {
  for (const channel in channels) {
    Object.assign(channels[channel], {
      get last_message() {
        const state = store.getState().messages;
        let last_message = state[channels[channel].id]?.[Object.keys(state[channels[channel].id] || {})[0]]
        return last_message || channels[channel].last_message
      }
    })
  }

  return channels
}


let HEARTBEAT: number;

export const createStore = (initProps: Partial<DataStore>) => {
  const store = create<DataStore>()(immer((set, get, store) => ({
    loaded: false,
    users: new Map(),
    messages: {},
    ws: undefined,
    connectionStatus: 'CONNECTING',
    relationships: new Map(),
    me: undefined as unknown as User,
    channels: new Map(),

    presence: new Map(),

    activeChannel: "",

    chat_status: {},
    ...initProps,

    async loadUser(id: string) {
      const { err, data } = await handleRequest<User>("GET", `/user/${id}`);


      if (!err && data && data.id) {
        set(({ users }) => ({
          users: new Map(users).set(data.id, data)
        }))
      }
    },

    async initConnection(tries: number = 1) {
      if (get().ws && (get().ws?.readyState === 1)) return;

      set({ connectionStatus: tries > 1 ? "RETRYING" : "CONNECTING" });

      const ws = new WebSocket(new URL("/ws", process.env.API_ENDPOINT?.replace('http', 'ws')))
      ws.binaryType = "arraybuffer"

      ws.onopen = (wse) => {
        console.info(`[RealTime] Established connection in ${tries} try.`);

        set({ connectionStatus: "ACTIVE" });

        HEARTBEAT = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            get().emit("PING", {});
          }
        }, 15000) as unknown as number;
      }

      ws.onmessage = (ev: MessageEvent) => {
        const { type, data } = JSON.parse(deflatePayload(ev.data));

        if (data) console.info(`[${type}]:`, data);

        if (type == "PONG") { }
        else if (type == "ME") {
          // Reset Tries
          tries = 0

          const init = data;

          set({
            me: init.me,
            relationships: new Map(Object.entries(init.relationships)),
            users: new Map(Object.entries(Object.assign(init.users, { [init.me.id]: init.me }))),
            presence: new Map(Object.entries(init.presence)),
            channels: new Map(Object.entries(init.channels)),
            loaded: true
          })
        } else if (type == "MESSAGE_CREATE") {
          const msg = data;
          const channel_id = msg.channel_id;

          set({
            messages: {
              ...(get().messages || {}),
              [channel_id]: {
                [msg.id]: msg,
                ...(get().messages[channel_id] || {})
              }
            }
          })

          set((state) => {
            if (!state.channels.has(channel_id)) return;

            const channels = new Map(state.channels);
            const channel = channels.get(channel_id)!;

            channels.set(channel_id, {
              ...channel,
              unread_message_count: get().me.id === msg.author_id ? 0 : (channel.unread_message_count ?? 0) + 1,
            });

            return { channels };
          });
        } else if (type == "CHAT_STATUS") {
          const status = data as ChatStatus;
          set(({ chat_status }) => ({
            chat_status: {
              ...chat_status,
              [status.channel_id]: {
                ...(chat_status[status.channel_id] || {}),
                [status.user_id]: status.status
              }
            }
          }))
        } else if (type == "CHANNEL_CREATE") {
          const channel = data as Channel;

          set(({ channels }) => ({
            channels: {
              [channel.id]: channel,
              ...channels,
            }
          }))
        } else if (type == "RELATIONSHIP_CREATE") {
          const relation = data as Relationship;

          // Check and load user

          if (!get().users.get(relation.user_id)) get().loadUser(relation.user_id)

          set(({ relationships }) => ({
            relationships: new Map(relationships).set(relation.id, relation)
          }))
        } else if (type == "RELATIONSHIP_DELETE") {
          const relation_id = data?.id;

          set(({ relationships }) => {
            const updated_relations = new Map(relationships);
            updated_relations.delete(relation_id);

            return ({
              relationships: updated_relations
            })
          })
        } else if (type == "RELATIONSHIP_UPDATE") {
          const relation = data as { id: RelationID } & Partial<Omit<Relationship, 'id'>>;

          set(({ relationships }) => {
            const updated_relations = new Map(relationships);
            const current_relationship = updated_relations.get(relation.id);

            if (!current_relationship) return {};

            updated_relations.set(relation.id, { ...current_relationship, ...relation });

            return ({
              relationships: updated_relations
            })
          })
        } else if (type == "PRESENCE_UPDATE") {
          const { id, ...presence } = data as { id: UserID } & Presence;

          set(({ presence: presences }) => ({
            presence: new Map(presences).set(id, presence)
          }))
        }
      }

      ws.onclose = (ev) => {
        clearInterval(HEARTBEAT);

        set({ connectionStatus: "FAILED" });
        console.log(`[RealTime] Failed to connect in ${tries} try. Retrying in ${tries} second`);

        set({ ws: undefined, loaded: false });

        if (tries <= 4) setTimeout(() => get().initConnection(tries + 1), tries * 1000);
        else {
          set({ connectionStatus: "SERVER_OFFLINE" });
          console.log(`[RealTime] Failed to failed, server seems down`);
        }
      }

      set((state) => {
        if (state.ws) state.ws.close(1000, "Reload"); // Must close!

        state.ws = ws
      })
    },

    emit(event, data) {
      const { ws } = get();
      if (!ws) return;

      return ws.send(pako.deflate(JSON.stringify({ type: event, data }), { level: 9, memLevel: 4 }))
    },

    async loadMessages(channel_id, before, limit, beforeStateSet) {
      const { err, data } = await handleRequest<{ messages: Record<string, Message>, count: number }>("GET", `/chats/${channel_id}/messages` + toQueryString({
        before, limit
      }))

      if (data) {
        beforeStateSet?.();
        set({
          messages: {
            ...get().messages,
            [channel_id]: { ...(get().messages[channel_id] || {}), ...data.messages },
          }
        })

        return data.count;
      }

      return 0;
    },

    async deleteMessage(channel_id, message_id) {
      const state = get();
      const channelMessages = { ...(state.messages[channel_id] || {}) };
      delete channelMessages[message_id]; // Remove the message
      set({
        messages: {
          ...state.messages,
          [channel_id]: channelMessages,
        },
      });
    },

    async ackMessage(channel_id, message_id) {
      const msgkeys = Object.keys(get().messages[channel_id]);
      let unread_msgs = 0;
      for (let i = 0; i < msgkeys.length; i++) {
        if (msgkeys[i] == message_id) break;
        unread_msgs++;
      }


      set(state => {
        const channels = new Map(state.channels);

        channels.set(channel_id, {
          ...channels.get(channel_id)!,
          unread_message_count: 0,
        });

        return { channels }
      })

      await handleRequest<null>(`POST`, `/chats/${channel_id}/messages/${message_id}/ack`);
    },

    async getMessage(channel_id, message_id) {
      return await handleRequest<Message>(`GET`, `/chats/${channel_id}/messages/${message_id}`)
    },

    setActiveChannel(channel_id) {
      set(({
        activeChannel: channel_id
      }))
    },
  })));

  return store
}

export const StoreContext = createContext<Store | null>(null);


export function useStore<T>(selector: (state: DataStore) => T): T {
  const store = useContext(StoreContext)
  if (!store) throw new Error('Missing StoreContext.Provider in the tree')
  return _useStore(store, selector)
}

// export { default as createUserStore } from "./users"