import { APIResponse } from "@/lib/api";
import { AttachmentType } from "./enums";
import { Attachment } from "@/types";

export type Message = {
  id: string;
  author_id: string;
  content: string;

  channel_id: string;
  updated_at: string;
  created_at: string;

  reply_to: Omit<Message, "reply_to">
  attachments: Attachment[]
}

export type Channel = {
  id: string
  is_private: boolean
  last_message?: Message;

  max_members: number;
  members: string[];
  name: string // name o' channel snapchat like shi
  created_at: string;
  unread_message_count: number
}

export type User = {
  id: string
  username: string
  display_name: string
}

export type MeUser = User

export interface Friend extends User {
  accepted_at: string
}

export type Chat = {
  channel_id: string;
  name: string;
  is_private: boolean;
  max_members: number;

  user: User
  created_at: string
}

export type Relationship = {
  id: string;
  user_id: string;
  created_at: string;
  accepted_at: string;
  incoming: boolean
}

export type ChannelID = string;
export type UserID = string;
export type MessageID = string;
export type RelationID = string;

export type ChatStatus = { status: "IDLE" | "TYPING", user_id: UserID, channel_id: ChannelID };

export type Presence = { presence: "OFFLINE" | "ONLINE", lastSeen: number | null }

export type ConnectionStatus = "ACTIVE" | "FAILED" | "CONNECTING" | "RETRYING" | "CLIENT_OFFLINE" | "SERVER_OFFLINE"

export type StoreState = {
  loaded: boolean;
  me: MeUser;
  relationships: Map<RelationID, Relationship>;
  ws?: WebSocket;
  channels: Map<ChannelID, Channel>;
  users: Map<UserID, User>;
  presence: Map<UserID, Presence>
  messages: Record<ChannelID, Record<MessageID, Message>>;

  connectionStatus: ConnectionStatus;

  chat_status: Record<ChannelID, Record<UserID, ChatStatus['status']>>

  activeChannel: ChannelID,
}

// TODO: 
export type RealtimeEvent = string;

export type StoreActions = {
  loadUser(id: string): Promise<void>
  initConnection(tries?: number): Promise<void>
  loadMessages(user_id: string, before?: string, limit?: number, beforeStateSet?: () => void): Promise<number>

  emit(event: RealtimeEvent, data: Record<any, unknown>): void
  deleteMessage(channel_id: string, message_id: string): Promise<void>
  ackMessage(channel_id: string, message_id: string): Promise<void>
  getMessage(channel_id: string, message_id: string): Promise<APIResponse<Message>>

  setActiveChannel(channel_id: ChannelID): void;
}

export type DataStore = StoreState & StoreActions;