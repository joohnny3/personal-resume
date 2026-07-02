/**
 * 清理 YAML 折行縮排產生的多餘空格:
 * 折疊區塊(>-)的換行會變成半形空格,夾在中文字之間很突兀。
 * 只移除「兩側皆為 CJK 或全形標點」的空格;英文單字邊界的空格保留。
 */
const CJK = "[\\u2014\\u3000-\\u303f\\u4e00-\\u9fff\\uf900-\\ufaff\\uff00-\\uffef]";
// 左側也接受半形標點(內文慣用半形逗號):「經驗, 開發過」→「經驗,開發過」
const LEFT = `(?:${CJK}|[,.;:!?)])`;
const CJK_GAP = new RegExp(`(${LEFT}) +(?=${CJK})`, "g");

function tidyString(s: string): string {
  return s.replace(CJK_GAP, "$1");
}

/** 深度走訪解析後的 YAML,清理所有字串欄位 */
export function tidy<T>(value: T): T {
  if (typeof value === "string") return tidyString(value) as T;
  if (Array.isArray(value)) return value.map((v) => tidy(v)) as T;
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = tidy(v);
    }
    return out as T;
  }
  return value;
}
