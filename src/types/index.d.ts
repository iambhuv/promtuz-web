import { Attachment } from "@/store/store";

export type DateString = string;


export type MakeRequired<T, K extends keyof T> =
  Partial<Omit<T, K>> & Pick<T, K>


export type PasteEvent = React.ClipboardEvent<HTMLDivElement>

export type LocalAttachment = Omit<Attachment, "id">

export type InputStatusType = "REPLYING" | "EDITING" | "ATTACHING" | "TEXT";

export type Simplify<T> = {[KeyType in keyof T]: T[KeyType]} & {};

export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
  : T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;