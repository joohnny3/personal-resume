import { Highlight } from "@/components/Section";
import type { Work } from "@/data/schema";
import { ym } from "@/lib/format";

export function Experience({ work }: { work: Work[] }) {
  return (
    <div className="space-y-14">
      {work.map((job) => (
        <article key={`${job.company.zh}-${job.startDate}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-lg font-semibold">
              {job.position.zh}
              <span aria-hidden className="mx-2 font-normal text-ink-muted">
                |
              </span>
              <span className="text-ink/85">{job.company.zh}</span>
            </h3>
            <p className="text-sm tabular-nums text-ink-muted">
              {ym(job.startDate)} — {job.endDate ? ym(job.endDate) : "至今"}
            </p>
          </div>
          {job.summary.zh !== "" && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">
              {job.summary.zh}
            </p>
          )}
          {job.highlights.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink/85 marker:text-vermilion/60">
              {job.highlights.map((h) => (
                <li key={h.zh}>
                  <Highlight text={h.zh} />
                </li>
              ))}
            </ul>
          )}
          {job.projects.length > 0 && (
            <div className="mt-6 space-y-8 border-l-2 border-line pl-5 sm:pl-6">
              {job.projects.map((proj) => (
                <section key={proj.name.zh}>
                  <h4 className="font-semibold">
                    {proj.name.zh}
                    <span className="ml-3 text-xs font-normal tabular-nums text-ink-muted">
                      {ym(proj.startDate)} — {proj.endDate ? ym(proj.endDate) : "至今"}
                    </span>
                  </h4>
                  <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">
                    {proj.purpose.zh}
                  </p>
                  <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink/85 marker:text-vermilion/60">
                    {proj.highlights.map((h) => (
                      <li key={h.zh}>
                        <Highlight text={h.zh} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
