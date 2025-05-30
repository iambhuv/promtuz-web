export const AttachmentType = {
  IMAGE: "IMAGE",
  AUDIO: "AUDIO",
  VIDEO: "VIDEO",
  DOCUMENT: "DOCUMENT",
  OTHER_FILE: "OTHER_FILE"
} as const;
export type AttachmentType = (typeof AttachmentType)[keyof typeof AttachmentType];


export const ChannelType = {
  GROUP_CHAT: "GROUP_CHAT",
  DIRECT_MESSAGES: "DIRECT_MESSAGES",
} as const;
export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];


