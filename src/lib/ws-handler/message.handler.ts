import { useStore } from '@/store';
import type { HandlerGroup } from '@/types/events';
import { playSound } from '../utils';

export const messageHandlers: HandlerGroup = {
  MESSAGE_CREATE(get, set, message) {
    const channel_id = message.channel_id;
    const me = get().me.id;
    const activeChannel = get().activeChannel;

    const playAudio = message.author_id !== me || !(document.hasFocus() && channel_id == activeChannel);

    if (playAudio) playSound(get().sounds.get("notification"));

    set({
      messages: {
        ...(get().messages || {}),
        [channel_id]: {
          [message.id]: message,
          ...(get().messages[channel_id] || {})
        }
      }
    })

    set((state) => {
      if (!state.channels.has(channel_id)) return {};

      const channels = new Map(state.channels);
      const channel = channels.get(channel_id)!;

      channels.set(channel_id, {
        ...channel,
        unread_message_count: get().me.id === message.author_id ? 0 : (channel.unread_message_count ?? 0) + 1,
      });

      return { channels };
    });
    // useMessageStore.setState()
  },
};
