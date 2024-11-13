export type DateString = string;


export type MakeRequired<T, K extends keyof T> =
  Partial<Omit<T, K>> & Pick<T, K>