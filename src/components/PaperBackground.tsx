/**
 * 全螢幕和紙背景(靜態版)。
 * 步驟 4 的 <SuminagashiCanvas> 會蓋在同一層;
 * 此元件同時是 reduced-motion / 無 WebGL 的退場畫面。
 */
export function PaperBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 bg-paper transition-colors duration-300">
      <div className="paper-noise absolute inset-0" />
      <div className="paper-vignette absolute inset-0" />
    </div>
  );
}
