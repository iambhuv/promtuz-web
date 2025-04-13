// import { User, Message, ChatStatus } from ""; // Your existing types

import { Channel, ChatStatus, Message, Presence, RelationID, Relationship, User } from "@/types/store";

import { DataStore } from "@/types/store";
import { StoreApi } from "zustand";

// Op -> Operation
type OpUpdate<T> = { id: string } & Partial<Omit<T, 'id'>>
type OpDelete<_T> = { id: string }

export type WebSocketEventMap = {
  INIT: {
    me: User;
    relationships: Record<string, Relationship>;
    users: Record<string, User>;
    presence: Record<string, Presence>;
    channels: Record<string, Channel>;
    session: string;
    push_token?: string;
  };

  MESSAGE_CREATE: Message;
  MESSAGE_UPDATE: OpUpdate<Message>;
  MESSAGE_DELETE: OpDelete<Message>;

  CHAT_STATUS: ChatStatus;

  CHANNEL_CREATE: Channel
  CHANNEL_UPDATE: OpUpdate<Channel>;
  CHANNEL_DELETE: OpDelete<Channel>;

  RELATIONSHIP_CREATE: Relationship
  RELATIONSHIP_UPDATE: OpUpdate<Relationship>;
  RELATIONSHIP_DELETE: OpDelete<Relationship>;

  PRESENCE_UPDATE: { id: string } & Presence

  PONG: {}
};

export type WebSocketEventType = keyof WebSocketEventMap;

export type WebSocketEvent<T extends WebSocketEventType = WebSocketEventType> = {
  type: T;
  data: WebSocketEventMap[T];
};


type T<E extends keyof WebSocketEventMap> = (
  get: StoreApi<DataStore>['getState'],
  set: StoreApi<DataStore>['setState'],
  data: WebSocketEventMap[E]
) => void;

// export type HandlerGroup = { [E in keyof WebSocketEventMap]?: T<E> }
export type HandlerGroup = Partial<Required<{ [E in keyof WebSocketEventMap]: T<E> }>>;