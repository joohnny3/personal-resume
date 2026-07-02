import type { Resume } from "@/data/schema";
import { ym } from "@/lib/format";

export function Education({
  education,
  languages,
}: {
  education: Resume["education"];
  languages: Resume["languages"];
}) {
  return (
    <div>
      <ul className="space-y-6">
        {education.map((edu) => (
          <li
            key={edu.institution.zh}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
          >
            <div>
              <h3 className="font-semibold">{edu.institution.zh}</h3>
              <p className="mt-0.5 text-sm text-ink-muted">
                {edu.area.zh}・{edu.studyType.zh}
              </p>
            </div>
            <p className="text-sm tabular-nums text-ink-muted">
              {ym(edu.startDate)} — {ym(edu.endDate)}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-10 border-t border-line pt-5 text-sm text-ink-muted">
        語言:
        {languages.map((l) => `${l.language.zh}(${l.fluency.zh})`).join("、")}
      </p>
    </div>
  );
}
