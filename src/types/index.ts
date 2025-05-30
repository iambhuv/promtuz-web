import { AttachmentType } from "@/store/enums";

export type DateString = string;


export type MakeRequired<T, K extends keyof T> =
  Partial<Omit<T, K>> & Pick<T, K>


export type PasteEvent = React.ClipboardEvent<HTMLDivElement>


export type Attachment = {
  id: string;
  /**
   * Name of original file
   */
  file_name: string;
  /**
   * File title
   */
  title: string;
  /**
   * File description
   */
  caption: string;
  /**
   * File size in bytes
   */
  size: number;
  /**
   * MIME Type
   */
  content_type: string;
  /**
   * Attachment Type
   */
  type: AttachmentType;
}

export type LocalAttachment = Partial<Attachment> & {
  name: string;
  file: File,
  hash: string
}



export type InputStatusType = "REPLYING" | "EDITING" | "ATTACHING" | "TEXT";

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
  : T extends object
  ? T extends infer O
  ? { [K in keyof O]: ExpandRecursively<O[K]> }
  : never
  : T;