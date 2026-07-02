import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";
import { resumeSchema, type Resume } from "./schema";

/**
 * 公開資料源:只讀 resume.yaml。
 * 個資(resume.private.yaml)的載入寫在獨立模組,公開頁面的
 * import 路徑永遠碰不到它——個資分級由檔案邊界強制。
 */
export function getPublicResume(): Resume {
  const file = path.join(process.cwd(), "resume.yaml");
  const raw = load(fs.readFileSync(file, "utf8"));
  return resumeSchema.parse(raw);
}
