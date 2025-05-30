export function getFirstKey<T extends object>(obj: T): keyof T | null {
  for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) return k;
  }
  return null;
}