/** 四種墨色(顯示時經 Beer–Lambert 吸收模型做減法混色,不直接蓋 RGB) */
export const INKS = [
  { label: "墨", hex: "#1a1a1f" },
  { label: "藍", hex: "#16407a" },
  { label: "朱", hex: "#c8372d" },
  { label: "松葉", hex: "#2e6e52" },
] as const;

/**
 * 墨色 → 吸收向量:paper * exp(-absorption) 會重現該墨色。
 * 兩色疊加時吸收量相加 → 相乘變暗,即水墨沉入紙面的減法混色。
 */
export function hexToAbsorption(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(((n >> 16) & 255) / 255, 0.02);
  const g = Math.max(((n >> 8) & 255) / 255, 0.02);
  const b = Math.max((n & 255) / 255, 0.02);
  return [-Math.log(r), -Math.log(g), -Math.log(b)];
}
