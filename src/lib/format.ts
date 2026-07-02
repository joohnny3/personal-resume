/** "2025-03" → "2025.03";空字串原樣回傳(進行中) */
export function ym(date: string): string {
  return date.replaceAll("-", ".");
}
