import { channelHandlers } from "./channel.handler";
import { initHandlers } from "./init.handler";
import { messageHandlers } from "./message.handler";
import { miscHandlers } from "./misc.handler";
import { relationHandlers } from "./relation.handler";

// Combine all handlers
export const eventHandlers = {
  ...initHandlers,
  ...miscHandlers,
  ...channelHandlers,
  ...relationHandlers,
  ...messageHandlers
} as const;