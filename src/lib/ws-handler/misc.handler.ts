import type { HandlerGroup } from '@/types/events';

export const miscHandlers: HandlerGroup = {
  PONG(get, set, data) {
      
  },
  PRESENCE_UPDATE(get, set, { id, ...presence }) {
    set(({ presence: presences }) => ({
      presence: new Map(presences).set(id, presence)
    }))
  },
  CHAT_STATUS(get, set, status) {
    set(({ chat_status }) => ({
      chat_status: {
        ...chat_status,
        [status.channel_id]: {
          ...(chat_status[status.channel_id] || {}),
          [status.user_id]: status.status
        }
      }
    }))
  },
} as const;