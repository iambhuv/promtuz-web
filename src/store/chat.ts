import { create } from "zustand";
import { combine } from 'zustand/middleware';
import { ChannelID, MessageID } from "./store";
import { LocalAttachment } from "@/types";
import { Descendant } from "slate";
import { hashFile } from "@/lib/utils";
import { AttachmentType } from "./enums";


// type InputStatusMessage = {
//   id: MessageID,
//   draft: boolean
//   content: string;
//   attachments: LocalAttachment[];
// }

type InputStatus = (
  | { type: "REPLYING"; refMessageID: MessageID }
  | { type: "EDITING"; refMessageID: MessageID }
  // | { type: "ATTACHING", attachments: LocalAttachment[] }
  | { type: "TEXT" }
);

interface ChatState {
  inputs: Record<ChannelID, InputStatus | undefined>,
  attachments: Record<ChannelID, Record<string, LocalAttachment>>,
  contents: Record<ChannelID, Descendant[]>
}


const EMPTY_DESCENDANT = [{ type: "paragraph", children: [{ text: "" }] }] as Descendant[];

export const useChatStore = create(combine(<ChatState>
  {
    inputs: {},
    attachments: {},
    contents: {}
  },
  (set, get) => ({
    setInputState: (channel_id: ChannelID, status: InputStatus) => {
      set(({ inputs }) => ({
        inputs: {
          ...inputs,
          [channel_id]: status
        }
      }))
    },
    removeInputState: (channel_id: ChannelID) => {
      set(({ inputs }) => {
        const { [channel_id]: _, ...other_inputs } = inputs;
        return {
          inputs: other_inputs
        }
      })
    },

    getInputAttachments(channel_id: ChannelID) {
      return get().attachments[channel_id] || {}
    },

    async attach(channel_id: ChannelID, file: File, attachment_type: AttachmentType = "OTHER_FILE") {
      const hash = await hashFile(file)
      const attachments = get().attachments[channel_id];

      for (const file_hash in attachments) {
        const attachment = attachments[file_hash];

        if (attachment.name == file.name && attachment.size == file.size) return;
      }

      const attachment = {
        name: file.name,
        file: file,
        hash: hash,
        content_type: file.type,
        type: attachment_type,
        size: file.size
      } satisfies LocalAttachment;

      set(({ attachments }) => ({
        attachments: {
          ...attachments,
          [channel_id]: {
            ...(get().attachments[channel_id] || {}),
            [hash]: attachment
          }
        }
      }))
    },

    async detach(channel_id: ChannelID, attachment: string) {

    },

    getInputContent(channel_id: ChannelID) {
      if (!get().contents[channel_id]) {
        set(({ contents }) => ({
          contents: {
            ...contents,
            [channel_id]: EMPTY_DESCENDANT
          }
        }))
        return EMPTY_DESCENDANT
      } else return get().contents[channel_id]
    },

    setInputContent(channel_id: ChannelID, content: Descendant[]) {
      set(({ contents }) => ({
        contents: {
          ...contents,
          [channel_id]: content
        }
      }))
    },


    clearAttachments(channel_id: ChannelID) {
      set(({ attachments }) => ({
        attachments: {
          ...attachments[channel_id],
          [channel_id]: {}
        }
      }))
    },
    clearContent(channel_id: ChannelID) {
      set(({ contents }) => ({
        contents: {
          ...contents,
          [channel_id]: EMPTY_DESCENDANT
        }
      }))
    }
  })
))

// useChatStore().