import type { ReactNode } from "react";

/** 區塊標題:硃砂小方印 + 疏朗字距 + 髮絲線 */
export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-8 flex items-center gap-3">
        <span aria-hidden className="size-2 bg-vermilion" />
        <h2 className="text-xl font-semibold tracking-[0.3em]">{title}</h2>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>
      {children}
    </section>
  );
}

/** 履歷條列的「前導詞:內文」樣式:全形冒號前的短前導詞加粗,利於掃讀 */
export function Highlight({ text }: { text: string }) {
  const i = text.indexOf(":");
  if (i > 0 && i <= 24) {
    return (
      <>
        <strong className="font-semibold">{text.slice(0, i + 1)}</strong>
        {text.slice(i + 1)}
      </>
    );
  }
  return <>{text}</>;
}
