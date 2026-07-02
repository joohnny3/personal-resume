import type { Resume } from "@/data/schema";

export function Hero({ basics }: { basics: Resume["basics"] }) {
  const profiles = basics.profiles.filter((p) => p.url !== "");

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
      <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
        <li>
          <a
            href={`mailto:${basics.email}`}
            className="underline decoration-line underline-offset-4 transition-colors hover:text-vermilion hover:decoration-vermilion"
          >
            {basics.email}
          </a>
        </li>
        <li>{basics.location.city.zh}</li>
        {profiles.map((p) => (
          <li key={p.network}>
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-line underline-offset-4 transition-colors hover:text-vermilion hover:decoration-vermilion"
            >
              {p.network}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
