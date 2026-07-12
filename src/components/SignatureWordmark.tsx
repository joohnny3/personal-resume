import type { CSSProperties } from "react";
import { SIG_STROKES, SIG_VIEWBOX, SIGNATURE_D } from "./signature-strokes";

/** 單層簽名 SVG;fill 用 currentColor,跟著文字色走。
 *  viewBox 已裁到墨跡實際範圍(原檔 1536×1024 四周有大量留白)。 */
function Glyph({ className }: { className?: string }) {
  return (
    <svg viewBox={SIG_VIEWBOX} fill="currentColor" className={className} aria-hidden>
      <path fillRule="evenodd" d={SIGNATURE_D} />
    </svg>
  );
}

/** 手寫簽名字標(Chang Yu Cheng)。
 *  hover 時朱紅「沿筆畫軌跡」上色,像重新簽一次名:朱紅簽名蓋著一層 SVG mask,
 *  mask 內是 24 筆筆芯中心線(粗圓頭描邊),以 stroke-dashoffset 依書寫順序
 *  逐筆「寫」出來——白描邊掃到哪,朱紅就露到哪。移開時最後一筆先退(倒筆收回)。
 *
 *  編舞用「單一時鐘」:.sig-scope 只過渡一個自訂屬性 --sig-t(0→1),
 *  每筆以 b/k 參數用 calc+clamp 從時鐘推導自己的 dashoffset(時間窗見
 *  signature-strokes.ts)。單一無延遲過渡 → hover 快速進出也不會有
 *  「延遲中的過渡被取消後不補排」的抖動問題;倒轉時鐘天然是倒筆收回。
 *  動畫規則在 globals.css 的 .sig-stroke 區塊;純 CSS,不需 Client Component,
 *  並尊重 prefers-reduced-motion。 */
export function SignatureWordmark({ className }: { className?: string }) {
  return (
    <span className={`sig-scope relative inline-flex ${className ?? ""}`}>
      {/* 底層:跟隨主題的墨色簽名 */}
      <Glyph className="h-full w-auto" />
      {/* 覆蓋層:朱紅簽名,由筆順遮罩控制顯露範圍 */}
      <svg
        viewBox={SIG_VIEWBOX}
        className="pointer-events-none absolute left-0 top-0 h-full w-auto"
        aria-hidden
      >
        <defs>
          <mask id="sig-write" maskUnits="userSpaceOnUse" x="209" y="295" width="1226" height="414">
            {SIG_STROKES.map((s, i) => (
              <path
                key={i}
                className="sig-stroke"
                d={s.d}
                style={
                  {
                    strokeWidth: s.w,
                    strokeDasharray: `${s.len} ${+(s.hide + s.len).toFixed(1)}`,
                    "--dash-hide": s.hide,
                    "--sig-b": s.b,
                    "--sig-k": s.k,
                  } as CSSProperties
                }
              />
            ))}
          </mask>
        </defs>
        <path fillRule="evenodd" d={SIGNATURE_D} fill="var(--sig-accent)" mask="url(#sig-write)" />
      </svg>
    </span>
  );
}
