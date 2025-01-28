import { Attachment } from ".";

export type MessagePayload = {
  content: string;
  reply_to?: string;
  attachments?: Partial<Attachment>[];
}