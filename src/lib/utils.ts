import { Message } from "@/store/store"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";
import moment from "moment";
import Pako from "pako";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeTrailingSlash(path: string) {
  return path.replace(/\/$/, "")
}

export function createURL(
  href: string,
  oldParams: Record<string, string>,
  newParams: Record<string, string | undefined>
) {
  const params = new URLSearchParams(oldParams)
  Object.entries(newParams).forEach(([key, value]) => {
    if (value == undefined) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
  })
  return `${href}?${params.toString()}`
}



export function createFallbackAvatar(name: string) {
  const name_split = name.split(/\W/).map(a => a[0]).filter(c => c);

  return name_split.length > 1 ? [name_split.at(0), name_split.at(-1)].join("") : name_split[0];
}

export const toQueryString = <O extends Record<string, any>>(obj: O) => "?".concat(Object.keys(obj).map(e => obj[e] ? `${encodeURIComponent(e)}=${encodeURIComponent(obj[e])}` : null).filter(e => !!e).join("&"));

export function parseMessageDate(ds: string, full: boolean = false) {
  const now = new Date();
  const date = new Date(ds);

  if (!full) return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)

  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) return 'Yesterday';

  if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return `${date.getDate()} ${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)}`;
  }

  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

type MessageBubbleProps = { message: Message, nextMessage?: Message, previousMessage?: Message };

export const shouldMessageShowTime = ({ message, nextMessage }: MessageBubbleProps): boolean => {
  const isSameAuthor = nextMessage && nextMessage.author_id === message.author_id;
  const currentTimestamp = new Date(message.created_at);
  const nextTimestamp = nextMessage ? new Date(nextMessage.created_at) : null;

  return !nextTimestamp ||
    !isSameAuthor ||
    currentTimestamp.getHours() !== nextTimestamp.getHours() ||
    currentTimestamp.getMinutes() !== nextTimestamp.getMinutes()
}

export const shouldMessageShowAuthor = ({ message, previousMessage }: MessageBubbleProps): boolean => {
  const isSameAuthor = previousMessage && previousMessage.author_id === message.author_id;
  const currentTimestamp = new Date(message.created_at);
  const previousTimestamp = previousMessage ? new Date(previousMessage.created_at) : null;

  return !previousTimestamp ||
    !isSameAuthor ||
    currentTimestamp.getHours() !== previousTimestamp.getHours() ||
    currentTimestamp.getMinutes() !== previousTimestamp.getMinutes()
}

export const shouldMessageMemo = (p1: MessageBubbleProps, p2: MessageBubbleProps) => {
  // console.log(p1, p2);

  if (p1.nextMessage?.content !== p2.nextMessage?.content) return false;
  if (p2.previousMessage?.content !== p1.previousMessage?.content) return false

  // message change re-render!
  if (p1.message.content !== p2.message.content) return false;
  // message got edited re-render
  if (p1.message.updated_at !== p2.message.updated_at) return false;

  return true;
}

export function getFirstKey<T extends object>(obj: T): keyof T | null {
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) return k;
  }
  return null;
}


export async function hashFile(file: File) {
  const ab = await crypto.subtle.digest("SHA-1", await file.arrayBuffer());

  return Buffer.from(ab).toString('hex')
}

export function beautifyLastSeen(date: string | number | Date) {
  const lastSeen = new Date(+date);
  if (isNaN(lastSeen.getTime())) return "Unknown";

  const diff = Date.now() - lastSeen.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} minutes ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hours ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} days ago`;

  return lastSeen.toLocaleDateString();
}


export function jsonBytes(payload: Record<string, any>) {
  // const formData = new FormData();

  // formData.set('json_payload', )

  return new Blob([Pako.deflate(Buffer.from(JSON.stringify(payload)))]);
}