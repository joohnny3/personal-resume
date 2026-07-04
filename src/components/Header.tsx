import type { ComponentType } from "react";
import {
  BriefcaseIcon,
  CodeIcon,
  GitHubIcon,
  LayersIcon,
  MediumIcon,
} from "./icons";
import { ThemeToggle } from "./ThemeToggle";
import type { Resume } from "@/data/schema";

/** 頁內導覽:一律 icon 呈現,滑鼠停留顯示文字(title),螢幕閱讀器讀 aria-label */
const anchors = [
  { href: "#skills", label: "技能", Icon: CodeIcon },
  { href: "#experience", label: "經歷", Icon: BriefcaseIcon },
  { href: "#portfolio", label: "作品", Icon: LayersIcon },
];

const profileIcons: Record<string, ComponentType<{ className?: string }>> = {
  GitHub: GitHubIcon,
  Medium: MediumIcon,
};

export function Header({
  name,
  profiles,
}: {
  name: string;
  profiles: Resume["basics"]["profiles"];
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-line bg-paper/75 backdrop-blur-sm transition-colors duration-300">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3 sm:px-8">
        <a href="#top" className="font-semibold tracking-[0.25em]">
          {name}
        </a>
        <div className="flex items-center gap-3 sm:gap-4">
          <nav aria-label="頁內導覽" className="flex items-center gap-3 sm:gap-4">
            {anchors.map(({ href, label, Icon }) => (
              <a
                key={href}
                href={href}
                aria-label={label}
                title={label}
                className="text-ink-muted transition-colors hover:text-vermilion"
              >
                <Icon className="size-[18px]" />
              </a>
            ))}
          </nav>
          <span aria-hidden className="h-4 w-px bg-line" />
          {profiles
            .filter((p) => p.url !== "" && profileIcons[p.network])
            .map((p) => {
              const Icon = profileIcons[p.network];
              return (
                <a
                  key={p.network}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={p.network}
                  title={p.network}
                  className="text-ink-muted transition-colors hover:text-vermilion"
                >
                  <Icon className="size-[18px]" />
                </a>
              );
            })}
          <span aria-hidden className="h-4 w-px bg-line" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
