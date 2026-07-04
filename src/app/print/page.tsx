import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Highlight } from "@/components/Section";
import { getPrintData } from "@/data/print";
import { ym } from "@/lib/format";

export const metadata: Metadata = {
  title: "張育誠 — 履歷",
  robots: { index: false, follow: false },
};

/** A4 / ATS 友善版:單欄、無流體無紋理、強制白底黑字、語意化標題與清單 */
export default function PrintPage() {
  const { resume, priv } = getPrintData();
  const {
    basics,
    work,
    education,
    skills,
    projects,
    languages,
    jobPreference,
    autobiography,
  } = resume;

  const prefLabels: [string, string][] = [
    ["status", "就業狀態"],
    ["type", "性質"],
    ["salary", "希望待遇"],
    ["locations", "希望地點"],
    ["remote", "遠端工作"],
    ["desiredPosition", "希望職稱"],
  ];
  const personal = [priv?.gender.zh, priv?.military.zh].filter(Boolean).join("・");

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* 蓋掉主題 tokens 的 body 底色,列印尾頁不露出和紙色 */}
      <style>{"html, body { background: #ffffff !important; }"}</style>
      <div className="mx-auto max-w-[46rem] px-8 py-10 text-[10.5pt] leading-[1.65] print:max-w-none print:px-0 print:py-0">
        {/* 基本資料 */}
        <header className="border-b-2 border-neutral-900 pb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h1 className="text-[20pt] font-bold tracking-wide">
              {basics.name.zh}
              <span className="ml-3 text-[11pt] font-normal text-neutral-600">
                {basics.name.en}({basics.nickname.zh})
              </span>
            </h1>
            <p className="text-[11.5pt] font-semibold">{basics.label.zh}</p>
          </div>
          <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[9.5pt] text-neutral-700">
            <li>Email:{basics.email}</li>
            {priv?.phone && <li>電話:{priv.phone}</li>}
            <li>所在地:{basics.location.city.zh}</li>
            {priv?.address.zh && <li>通訊地址:{priv.address.zh}</li>}
            {priv?.birthday && <li>生日:{priv.birthday}</li>}
            {personal && <li>{personal}</li>}
            {basics.profiles
              .filter((p) => p.url !== "")
              .map((p) => (
                <li key={p.network}>
                  {p.network}:{p.url}
                </li>
              ))}
          </ul>
        </header>

        <PrintSection title="簡介">
          {basics.highlights.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-5">
              {basics.highlights.map((h) => (
                <li key={h.zh}>{h.zh}</li>
              ))}
            </ul>
          )}
          <p className={basics.highlights.length > 0 ? "mt-2" : ""}>
            {basics.summary.zh}
          </p>
        </PrintSection>

        <PrintSection title="技能">
          {skills.map((group) => (
            <div key={group.name.zh} className="mt-2.5 break-inside-avoid first:mt-0">
              <h3 className="font-semibold">
                {group.name.zh}
                <span className="ml-2 text-[9pt] font-normal text-neutral-600">
                  {group.keywords.join("、")}
                </span>
              </h3>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {group.details.map((d) => (
                  <li key={d.zh}>
                    <Highlight text={d.zh} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </PrintSection>

        <PrintSection title="工作經歷">
          {work.map((job) => (
            <article key={`${job.company.zh}-${job.startDate}`} className="mt-4 first:mt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 break-after-avoid">
                <h3 className="text-[11pt] font-bold">
                  {job.position.zh}|{job.company.zh}
                </h3>
                <p className="text-[9.5pt] text-neutral-600">
                  {ym(job.startDate)} — {job.endDate ? ym(job.endDate) : "至今"}
                </p>
              </div>
              {job.summary.zh !== "" && <p className="mt-1 text-neutral-800">{job.summary.zh}</p>}
              {job.highlights.length > 0 && (
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {job.highlights.map((h) => (
                    <li key={h.zh}>
                      <Highlight text={h.zh} />
                    </li>
                  ))}
                </ul>
              )}
              {job.projects.map((proj) => (
                <section
                  key={proj.name.zh}
                  className="mt-2.5 break-inside-avoid border-l-2 border-neutral-200 pl-4"
                >
                  <h4 className="font-semibold">
                    {proj.name.zh}
                    <span className="ml-2 text-[9pt] font-normal text-neutral-600">
                      {ym(proj.startDate)} — {proj.endDate ? ym(proj.endDate) : "至今"}
                    </span>
                  </h4>
                  <p className="text-neutral-700">{proj.purpose.zh}</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {proj.highlights.map((h) => (
                      <li key={h.zh}>
                        <Highlight text={h.zh} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </article>
          ))}
        </PrintSection>

        <PrintSection title="專案">
          {projects.map((proj) => (
            <article key={proj.name.zh} className="mt-3 break-inside-avoid first:mt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="text-[11pt] font-bold">{proj.name.zh}</h3>
                <p className="text-[9.5pt] text-neutral-600">
                  {ym(proj.startDate)} — {proj.endDate ? ym(proj.endDate) : "仍在進行"}
                </p>
              </div>
              {proj.url !== "" && <p className="text-[9.5pt] text-neutral-600">{proj.url}</p>}
              <p className="mt-1 text-neutral-800">{proj.description.zh}</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {proj.highlights.map((h) => (
                  <li key={h.zh}>
                    <Highlight text={h.zh} />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </PrintSection>

        <PrintSection title="學歷">
          <ul className="space-y-1.5">
            {education.map((edu) => (
              <li
                key={edu.institution.zh}
                className="flex flex-wrap items-baseline justify-between gap-x-3"
              >
                <p>
                  <span className="font-semibold">{edu.institution.zh}</span>
                  <span className="ml-2 text-neutral-700">
                    {edu.area.zh}・{edu.studyType.zh}
                  </span>
                </p>
                <p className="text-[9.5pt] text-neutral-600">
                  {ym(edu.startDate)} — {ym(edu.endDate)}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-neutral-700">
            語言:
            {languages.map((l) => `${l.language.zh}(${l.fluency.zh})`).join("、")}
          </p>
        </PrintSection>

        {jobPreference && (
          <PrintSection title="求職條件">
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {prefLabels.map(
                ([key, label]) =>
                  jobPreference[key] && (
                    <li key={key}>
                      {label}:{jobPreference[key].zh}
                    </li>
                  ),
              )}
            </ul>
          </PrintSection>
        )}

        {autobiography && (
          <PrintSection title="自傳">
            <p className="whitespace-pre-line">{autobiography.zh}</p>
          </PrintSection>
        )}
      </div>
    </div>
  );
}

function PrintSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="break-after-avoid border-b border-neutral-300 pb-1 text-[12pt] font-bold tracking-[0.2em]">
        {title}
      </h2>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}
