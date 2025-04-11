import type { HandlerGroup } from '@/types/events';

export const initHandlers: HandlerGroup = {
  INIT: (_get, set, data) => {
    set({
      me: data.me,
      relationships: new Map(Object.entries(data.relationships)),
      users: new Map(Object.entries(Object.assign(data.users, { [data.me.id]: data.me }))),
      presence: new Map(Object.entries(data.presence)),
      channels: new Map(Object.entries(data.channels)),
      loaded: true
    })
  },
} as const;