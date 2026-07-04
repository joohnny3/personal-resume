import type { Resume } from "@/data/schema";

export function Hero({ basics }: { basics: Resume["basics"] }) {
  return (
    <section id="top" className="pt-6 sm:pt-10">
      <p className="text-sm tracking-[0.4em] text-vermilion">{basics.label.zh}</p>
      <div className="mt-4 flex items-start justify-between gap-6">
        <h1 className="text-4xl font-bold tracking-wide sm:text-5xl">
          {basics.name.zh}
          <span className="ml-3 align-middle text-lg font-normal text-ink-muted">
            {basics.nickname.zh}
          </span>
        </h1>
        {/* 硃砂印 */}
        <span
          aria-hidden
          className="flex size-12 shrink-0 select-none items-center justify-center rounded-sm bg-vermilion text-2xl font-bold text-[#f4efe3] shadow-sm"
        >
          誠
        </span>
      </div>
      <p className="mt-8 max-w-2xl leading-loose text-ink/90">{basics.summary.zh}</p>
      <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-muted">
        <li>
          {/* 相對路徑:自動落在 basePath 底下;檔案由 npm run pdf / CI 產出 */}
          <a
            href="chang-yu-cheng-resume.pdf"
            download
            className="rounded-full border border-line px-4 py-1.5 text-ink transition-colors hover:border-vermilion hover:text-vermilion"
          >
            下載 PDF 履歷 ↓
          </a>
        </li>
        <li>
          <a
            href={`mailto:${basics.email}`}
            className="underline decoration-line underline-offset-4 transition-colors hover:text-vermilion hover:decoration-vermilion"
          >
            {basics.email}
          </a>
        </li>
        <li>{basics.location.city.zh}</li>
      </ul>
    </section>
  );
}
