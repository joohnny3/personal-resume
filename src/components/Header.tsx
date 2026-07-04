import type { ComponentType } from "react";
import { GitHubIcon, MediumIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";
import type { Resume } from "@/data/schema";

const anchors = [
  { href: "#skills", label: "技能" },
  { href: "#experience", label: "經歷" },
  { href: "#portfolio", label: "作品" },
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
        <div className="flex items-center gap-5">
          <nav className="hidden gap-6 text-sm text-ink-muted sm:flex">
            {anchors.map((a) => (
              <a key={a.href} href={a.href} className="transition-colors hover:text-vermilion">
                {a.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
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
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
