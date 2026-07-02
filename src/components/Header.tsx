import { ThemeToggle } from "./ThemeToggle";

const anchors = [
  { href: "#skills", label: "技能" },
  { href: "#experience", label: "經歷" },
  { href: "#portfolio", label: "作品" },
  { href: "#education", label: "學歷" },
];

export function Header({ name }: { name: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-line bg-paper/75 backdrop-blur-sm transition-colors duration-300">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3 sm:px-8">
        <a href="#top" className="font-semibold tracking-[0.25em]">
          {name}
        </a>
        <div className="flex items-center gap-6">
          <nav className="hidden gap-6 text-sm text-ink-muted sm:flex">
            {anchors.map((a) => (
              <a key={a.href} href={a.href} className="transition-colors hover:text-vermilion">
                {a.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
