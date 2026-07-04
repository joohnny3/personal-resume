import { existsSync } from "node:fs";
import { join } from "node:path";
import { CopyEmail } from "@/components/CopyEmail";
import { LineIcon } from "@/components/icons";
import type { Resume } from "@/data/schema";

export function Hero({ basics }: { basics: Resume["basics"] }) {
  const lineUrl =
    basics.profiles.find((p) => p.network === "LINE")?.url ?? "";
  // 照片放 public/、檔名由 resume.yaml 的 basics.image 指定;
  // 建置時檢查檔案存在才輸出,避免上線後出現破圖
  const hasPhoto =
    basics.image !== "" &&
    existsSync(join(process.cwd(), "public", basics.image));
  // 檔案還沒放時,只在本機開發模式畫出虛線框提示位置,正式建置不輸出
  const showPlaceholder = !hasPhoto && process.env.NODE_ENV === "development";

  return (
    <section id="top" className="pt-6 sm:pt-10">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
        {hasPhoto && (
          <img
            src={basics.image}
            alt={`${basics.name.zh}的照片`}
            className="size-40 shrink-0 rounded-2xl border border-line object-cover shadow-sm grayscale transition duration-500 hover:grayscale-0 sm:size-44"
          />
        )}
        {showPlaceholder && (
          <div className="flex size-40 shrink-0 items-center justify-center rounded-2xl border border-dashed border-line sm:size-44">
            <span className="px-4 text-center text-xs leading-relaxed text-ink-muted">
              照片位置
              <br />
              public/{basics.image}
              <br />
              (僅開發模式顯示)
            </span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm tracking-[0.4em] text-vermilion">
            {basics.label.zh}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-wide sm:text-5xl">
            {basics.name.zh}
            <span className="ml-3 align-middle text-lg font-normal text-ink-muted">
              {basics.nickname.zh}
            </span>
          </h1>
          {basics.highlights.length > 0 && (
            <>
              <ul className="mt-8 max-w-2xl list-disc space-y-2 pl-5 leading-relaxed text-ink/90 marker:text-vermilion/60">
                {basics.highlights.map((h) => (
                  <li key={h.zh}>{h.zh}</li>
                ))}
              </ul>
              {/* 條列與收尾段之間的短分隔線 */}
              <span aria-hidden className="mt-8 block h-px w-12 bg-ink/25" />
            </>
          )}
          <p className="mt-8 max-w-2xl leading-loose text-ink/90">
            {basics.summary.zh}
          </p>
        </div>
      </div>
      {/* 聯絡方式:信箱(點擊複製)與 LINE 加好友;PDF 下載與所在地已依需求移除 */}
      <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-muted">
        <li>
          <CopyEmail email={basics.email} />
        </li>
        {lineUrl !== "" && (
          <li>
            <a
              href={lineUrl}
              target="_blank"
              rel="noreferrer"
              title="加 LINE 好友"
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-vermilion"
            >
              <LineIcon className="size-[18px]" />
              <span className="underline decoration-line underline-offset-4 transition-colors group-hover:decoration-vermilion">
                {lineUrl.replace(/^https?:\/\//, "")}
              </span>
            </a>
          </li>
        )}
      </ul>
    </section>
  );
}
