"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

/**
 * 點擊複製 Email。
 * mailto: 依賴訪客電腦有設定預設郵件程式,沒有就毫無反應;
 * 複製到剪貼簿對誰都有效,貼到任何信箱都能寄。
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
      <span className="underline decoration-line underline-offset-4 transition-colors group-hover:decoration-vermilion">
        {email}
      </span>
      {copied ? (
        <CheckIcon className="size-3.5 text-pine" />
      ) : (
        <CopyIcon className="size-3.5 opacity-70" />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "已複製" : ""}
      </span>
    </button>
  );
}
