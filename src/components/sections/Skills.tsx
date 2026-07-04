"use client";

import { useState } from "react";
import { Highlight } from "@/components/Section";
import { ChevronDownIcon } from "@/components/icons";
import type { SkillGroup } from "@/data/schema";

/** 收合時每組先露出的列點數;超過的收進「展開」裡,讓各卡高度接近 */
const VISIBLE = 3;

export function Skills({ skills }: { skills: SkillGroup[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {skills.map((group) => (
        <SkillCard key={group.name.zh} group={group} />
      ))}
    </div>
  );
}

function SkillCard({ group }: { group: SkillGroup }) {
  const [open, setOpen] = useState(false);
  const hiddenCount = group.details.length - VISIBLE;
  const shown = open ? group.details : group.details.slice(0, VISIBLE);

  return (
    <article className="rounded-md border border-line bg-paper-raised/60 p-6 transition-colors duration-300">
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
        {shown.map((d) => (
          <li key={d.zh}>
            <Highlight text={d.zh} />
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="ml-5 mt-3 inline-flex items-center gap-1 text-xs text-ink-muted transition-colors hover:text-vermilion"
        >
          {open ? "收合" : `⋯ 展開其餘 ${hiddenCount} 項`}
          <ChevronDownIcon
            className={`size-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </article>
  );
}
