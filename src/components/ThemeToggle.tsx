"use client";

import { useEffect, useState } from "react";

/** 深淺色手動切換:寫入 localStorage,重整後由 layout 的初始化腳本還原 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* 無痕模式等情境寫不進去就算了,當次切換仍生效 */
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "切換為淺色(和紙)" : "切換為深色(夜墨)"}
      className="flex size-8 select-none items-center justify-center rounded-full border border-line text-sm transition-colors hover:border-vermilion hover:text-vermilion"
    >
      {dark ? "月" : "日"}
    </button>
  );
}
