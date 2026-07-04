import { existsSync } from "node:fs";
import { join } from "node:path";
import { CopyEmail } from "@/components/CopyEmail";
import type { Resume } from "@/data/schema";

export function Hero({ basics }: { basics: Resume["basics"] }) {
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
          <p className="mt-8 max-w-2xl leading-loose text-ink/90">
            {basics.summary.zh}
          </p>
        </div>
      </div>
      <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-muted">
        <li>
          {/* 相對路徑:自動落在 basePath 底下;檔案由 npm run pdf / CI 產出 */}
          <a
            href="chang-yu-cheng-resume.pdf"
            download
            className="rounded-full border border-line px-4 py-1.5 text-ink transition-colors hover:border-vermilion hover:text-vermilion"
          >
            下載 PDF 履歷 ↓
          </a>
        </li>
        <li>
          <CopyEmail email={basics.email} />
        </li>
        <li>{basics.location.city.zh}</li>
      </ul>
    </section>
  );
}
