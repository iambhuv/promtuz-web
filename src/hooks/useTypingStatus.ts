import { useStore } from '@/store';
import { ChannelID } from '@/store/store';
import { useRef } from 'react';

const useTypingStatus = (channel: ChannelID) => {
  const ws_emit = useStore(store => store.emit);
  const typingRef = useRef<any>(null)

  const handleTypingStatus = (value: string) => {
    if (!value.trim()) {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
        typingRef.current = null;
        ws_emit("CHAT_STATUS", { channel_id: channel, status: "IDLE" })
      }
      return;
    }

    // Clear any existing timeout before setting a new one
    if (typingRef.current) {
      clearTimeout(typingRef.current);
    }

    if (typingRef.current == null) {
      ws_emit("CHAT_STATUS", { channel_id: channel, status: "TYPING" });
    }

    // Set a new timeout
    typingRef.current = setTimeout(() => {
      ws_emit("CHAT_STATUS", { channel_id: channel, status: "IDLE" });
      clearTimeout(typingRef.current);
      typingRef.current = null;
    }, 7000);
  };

  return { handleTypingStatus }
}

export default useTypingStatus
