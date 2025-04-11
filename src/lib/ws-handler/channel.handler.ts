import type { HandlerGroup } from '@/types/events';

export const channelHandlers: HandlerGroup = {
  CHANNEL_CREATE: (get, set, channel) => {
    set(({ channels }) => ({
      channels: {
        [channel.id]: channel,
        ...channels,
      }
    }))
  },
  CHANNEL_UPDATE: (get, set, channel) => {

  },
  CHANNEL_DELETE: (get, set, channel) => {

  },
} as const;