import { handleRequest } from '@/lib/api';
import { toQueryString } from '@/lib/utils';
import pako from "pako";
import { createContext, useContext } from 'react';
import { useStore as _useStore, create, StoreApi } from 'zustand';
import { Channel, ChatStatus, DataStore, Message, MeUser, User } from './store';

import { immer } from 'zustand/middleware/immer';


export type Store = ReturnType<typeof createStore>;

function deflatePayload(data: Uint8Array) {
  return pako.inflate(data, { to: "string" })
}


function setupChannelList(channels: Record<string, Channel>, store: StoreApi<DataStore>) {
  // channels.map((channel) => ({
  //   ...channel,
  // get last_message() {
  //   const state = store.getState().messages;
  //   return state[channel.id][Object.keys(state[channel.id])[0]]
  // }
  // }))

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


export const createStore = (initProps: Partial<DataStore>) => {
  const store = create<DataStore>()(immer((set, get, store) => ({
    loaded: false,
    users: new Map(),
    messages: {},
    ws: undefined,
    connectionStatus: 'CONNECTING',
    relationships: [],
    me: undefined as unknown as MeUser,
    chats: [],
    channels: {},

    chat_status: {},
    ...initProps,

    async loadUser(id: string) {
      id.toString()
      return get().me!
    },

    async initConnection(tries: number = 1) {
      if (get().ws && (get().ws?.readyState === 1)) return;

      set({ connectionStatus: tries > 1 ? "RETRYING" : "CONNECTING" });

      const ws = new WebSocket(new URL("/ws", process.env.API_ENDPOINT?.replace('http', 'ws')))
      ws.binaryType = "arraybuffer"

      ws.onopen = (ws) => {
        console.info(`[RealTime] Established connection in ${tries} try.`);

        set({ connectionStatus: "ACTIVE" });
      }

      ws.onmessage = (ev: MessageEvent) => {
        const { type, data } = JSON.parse(deflatePayload(ev.data));

        console.info(`[${type}]:`, data);

        if (type == "ME") {
          // Reset Tries
          tries = 0

          const init = data;
          const users: [string, User][] = (<User[]>init.users || []).concat([init.me]).map(({ id, ...user }) => [id, { id, ...user }])

          set({
            me: init.me,
            relationships: init.relationships || get().relationships,
            users: new Map(users) || get().users,
            channels: setupChannelList(init.channels, store) || get().channels,
            loaded: true
          })
        } else if (type == "MESSAGE_CREATE") {
          const msg = data;
          const chat_id = msg.channel_id;

          set({
            messages: {
              ...(get().messages || {}),
              [chat_id]: {
                [msg.id]: msg,
                ...(get().messages[chat_id] || {})
              }
            }
          })

          set(state => {
            if (get().me.id !== msg.author_id)
              void (++state.channels[chat_id].unread_message_count)
            else {
              void (state.channels[chat_id].unread_message_count = 0)
            }
          })
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
        }
      }

      ws.onclose = (ev) => {
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

      set(state => { void (state.channels[channel_id].unread_message_count = 0) })

      await handleRequest<null>(`POST`, `/chats/${channel_id}/messages/${message_id}/ack`);
    },

    async getMessage(channel_id, message_id) {
      return await handleRequest<Message>(`GET`, `/chats/${channel_id}/messages/${message_id}`)
    }
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