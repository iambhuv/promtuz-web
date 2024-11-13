export const AttachmentType = {
  IMAGE: "IMAGE",
  AUDIO: "AUDIO",
  VIDEO: "VIDEO",
  DOCUMENT: "DOCUMENT",
  OTHER_FILE: "OTHER_FILE"
} as const;
export type AttachmentType = (typeof AttachmentType)[keyof typeof AttachmentType];