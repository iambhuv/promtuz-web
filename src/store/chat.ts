import { create } from "zustand";
import { combine } from 'zustand/middleware';
import { ChannelID, MessageID } from "./store";
import { LocalAttachment } from "@/types";

type InputStatus = (
  | { type: "REPLYING"; refMessage: MessageID }
  | { type: "EDITING"; refMessage: MessageID }
  | { type: "ATTACHING", attachments: LocalAttachment[] }
  | { type: "TEXT" }
);

interface ChatState {
  inputs: Record<ChannelID, InputStatus | undefined>
}


export const useChatStore = create(combine(<ChatState>
  {
    inputs: {}
  },
  (set) => ({
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
    }
  })
))

// useChatStore().