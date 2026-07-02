import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";
import { getPublicResume } from "./resume";
import { privateSchema, type PrivateInfo, type Resume } from "./schema";
import { tidy } from "./tidy";

/**
 * /print(PDF)專用:公開資料 + 個資。
 * 個資來源優先序:
 *   1. RESUME_PRIVATE_YAML 環境變數(CI 以 GitHub Actions Secret 注入)
 *   2. 本機 resume.private.yaml(gitignored)
 * 兩者皆無(例如部署 job 的建置)→ priv = null,/print 輸出不含個資。
 */
export function getPrintData(): { resume: Resume; priv: PrivateInfo | null } {
  const resume = getPublicResume();

  let raw: unknown = null;
  const fromEnv = process.env.RESUME_PRIVATE_YAML;
  if (fromEnv && fromEnv.trim() !== "") {
    raw = load(fromEnv);
  } else {
    const file = path.join(process.cwd(), "resume.private.yaml");
    if (fs.existsSync(file)) {
      raw = load(fs.readFileSync(file, "utf8"));
    }
  }
  if (raw == null) return { resume, priv: null };

  return { resume, priv: privateSchema.parse(tidy(raw)).private };
}
