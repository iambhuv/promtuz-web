// All Receivable Event Types Here

import { Channel, Message, MeUser, Relationship, User } from "@/store/store";
import { DateString, MakeRequired } from "./generics";

interface RealtimeReceivableEvents {
  "ME": { me: MeUser, channels: { [channel_id: string]: Channel }, relationships: Relationship[], users: User[] }

  // Message Events
  "MESSAGE_CREATE": Message
  "MESSAGE_UPDATE": Message
  "MESSAGE_DELETE": Pick<Message, 'id' | "channel_id" | "author_id">

  // Channel Events
  "CHANNEL_CREATE": Omit<Channel, "last_message">
  "CHANNEL_UPDATE": Omit<Channel, "last_message">
  "CHANNEL_DELETE": Omit<Channel, "last_message" | "members">

  // Relationship Events
  "RELATION_CREATE": Relationship,
  "RELATION_UPDATE": Relationship,
  "RELATION_DELETE": Relationship,
}