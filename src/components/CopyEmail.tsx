"use client";

import { useEffect, useRef, useState } from "react";
import { MailIcon } from "./icons";

/**
 * 點擊複製 Email。
 * mailto: 依賴訪客電腦有設定預設郵件程式,沒有就毫無反應;
 * 複製到剪貼簿對誰都有效,貼到任何信箱都能寄。
 * 視覺與聯絡列其他項目一致(icon + 文字);複製成功時文字原地短暫變「已複製 ✓」。
 */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function legacyCopy(text: string): boolean {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(email);
      ok = true;
    } catch {
      // 非 https、瀏覽器擋剪貼簿權限等情況,退回舊式複製
      ok = legacyCopy(email);
    }
    if (ok) {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } else {
      // 兩種複製都失敗才退回 mailto,至少給有郵件程式的人一條路
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="點一下複製 Email"
      aria-label={`複製 Email:${email}`}
      className="group inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-vermilion"
    >
      <MailIcon className="size-[18px]" />
      {/* 疊在原文字上顯示回饋,寬度不變、旁邊的項目不會位移 */}
      <span className="relative">
        <span
          className={`underline decoration-line underline-offset-4 transition-colors group-hover:decoration-vermilion ${
            copied ? "invisible" : ""
          }`}
        >
          {email}
        </span>
        {copied && (
          <span className="absolute inset-y-0 left-0 text-pine">已複製 ✓</span>
        )}
      </span>
      <span aria-live="polite" className="sr-only">
        {copied ? "已複製" : ""}
      </span>
    </button>
  );
}
