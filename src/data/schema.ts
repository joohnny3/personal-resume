import { z } from "zod";

/** 文案欄位一律 {zh, en};en 未填時以空字串補上 */
const bilingual = z.object({
  zh: z.string(),
  en: z.string().default(""),
});

/** "YYYY-MM" 或空字串(進行中) */
const dateStr = z.string();

const profileSchema = z.object({
  network: z.string(),
  username: z.string().default(""),
  url: z.string().default(""),
});

/** 工作經歷底下的子專案(PAP 平台、HRMS…) */
const workProjectSchema = z.object({
  name: bilingual,
  startDate: dateStr,
  endDate: dateStr,
  purpose: bilingual,
  highlights: z.array(bilingual),
});

const workSchema = z.object({
  company: bilingual,
  position: bilingual,
  location: bilingual,
  startDate: dateStr,
  endDate: dateStr,
  summary: bilingual,
  projects: z.array(workProjectSchema).default([]),
  highlights: z.array(bilingual).default([]),
});

const educationSchema = z.object({
  institution: bilingual,
  area: bilingual,
  studyType: bilingual,
  startDate: dateStr,
  endDate: dateStr,
});

const skillGroupSchema = z.object({
  name: bilingual,
  keywords: z.array(z.string()),
  details: z.array(bilingual),
});

/** 獨立作品(OpenClaw…) */
const projectSchema = z.object({
  name: bilingual,
  startDate: dateStr,
  endDate: dateStr.default(""),
  url: z.string().default(""),
  description: bilingual,
  highlights: z.array(bilingual),
});

const languageSchema = z.object({
  language: bilingual,
  fluency: bilingual,
});

export const resumeSchema = z.object({
  meta: z.object({
    version: z.string(),
    updated: z.string(),
  }),
  basics: z.object({
    name: bilingual,
    nickname: bilingual,
    label: bilingual,
    email: z.email(),
    /** public/ 底下的照片檔名;空字串 = 不顯示照片 */
    image: z.string().default(""),
    location: z.object({ city: bilingual }),
    summary: bilingual,
    profiles: z.array(profileSchema),
  }),
  work: z.array(workSchema),
  education: z.array(educationSchema),
  skills: z.array(skillGroupSchema),
  projects: z.array(projectSchema),
  languages: z.array(languageSchema),
  // 以下僅供 /print(PDF)版面,公開頁面不渲染
  jobPreference: z.record(z.string(), bilingual).optional(),
  autobiography: bilingual.optional(),
});

/** resume.private.yaml:僅 /print(PDF)使用,gitignored、CI 以 Secret 注入 */
export const privateSchema = z.object({
  private: z.object({
    phone: z.string().default(""),
    address: z
      .object({ zh: z.string().default(""), en: z.string().default("") })
      .default({ zh: "", en: "" }),
    birthday: z.string().default(""),
    gender: z.object({ zh: z.string().default("") }).default({ zh: "" }),
    military: z.object({ zh: z.string().default("") }).default({ zh: "" }),
  }),
});

export type PrivateInfo = z.infer<typeof privateSchema>["private"];
export type Resume = z.infer<typeof resumeSchema>;
export type Bilingual = z.infer<typeof bilingual>;
export type Work = z.infer<typeof workSchema>;
export type WorkProject = z.infer<typeof workProjectSchema>;
export type Project = z.infer<typeof projectSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
