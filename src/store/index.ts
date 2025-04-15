import { handleRequest } from '@/lib/api';
import { toQueryString } from '@/lib/utils';
import pako from "pako";
import { createContext, useContext } from 'react';
import { useStore as _useStore, create, StoreApi } from 'zustand';
import { Channel, ChatStatus, DataStore, Message, MeUser, Presence, RelationID, Relationship, User, UserID } from '../types/store';

import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { eventHandlers } from '@/lib/ws-handler';
import { WebSocketEventMap } from '@/types/events';

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
    session: "",

    chatStatus: {},
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

      const ws = new WebSocket(new URL("/ws", process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('http', 'ws')))
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
        const parsed = JSON.parse(deflatePayload(ev.data)) as {
          [K in keyof WebSocketEventMap]: { type: K; data: WebSocketEventMap[K] };
        }[keyof WebSocketEventMap];

        const { type, data } = parsed;

        console.info(`[${type}]:`, data);

        const handler = eventHandlers[type];

        if (handler) {
          handler(get, set, <any>data);
        } else {
          console.error(`Cannot Find Event Handler for Event: [${type}]`);
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