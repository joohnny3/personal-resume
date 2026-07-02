import { Highlight } from "@/components/Section";
import type { SkillGroup } from "@/data/schema";

export function Skills({ skills }: { skills: SkillGroup[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {skills.map((group) => (
        <article
          key={group.name.zh}
          className="rounded-md border border-line bg-paper-raised/60 p-6 transition-colors duration-300"
        >
          <h3 className="text-lg font-semibold">{group.name.zh}</h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {group.keywords.map((kw) => (
              <li
                key={kw}
                className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-muted"
              >
                {kw}
              </li>
            ))}
          </ul>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink/85 marker:text-vermilion/60">
            {group.details.map((d) => (
              <li key={d.zh}>
                <Highlight text={d.zh} />
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
