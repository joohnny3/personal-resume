import { Highlight } from "@/components/Section";
import type { Project } from "@/data/schema";
import { ym } from "@/lib/format";

export function Portfolio({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-6">
      {projects.map((proj) => (
        <article
          key={proj.name.zh}
          className="rounded-md border border-line bg-paper-raised/60 p-6 transition-colors duration-300 sm:p-8"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-xl font-semibold">{proj.name.zh}</h3>
            <p className="text-sm tabular-nums text-ink-muted">
              {ym(proj.startDate)} — {proj.endDate ? ym(proj.endDate) : "仍在進行"}
            </p>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink/90">
            {proj.description.zh}
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink/85 marker:text-vermilion/60">
            {proj.highlights.map((h) => (
              <li key={h.zh}>
                <Highlight text={h.zh} />
              </li>
            ))}
          </ul>
          {proj.url !== "" && (
            <a
              href={proj.url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block text-sm text-indigo-ink underline decoration-line underline-offset-4 transition-colors hover:text-vermilion hover:decoration-vermilion"
            >
              前往查看 ↗
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
