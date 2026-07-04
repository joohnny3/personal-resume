"use client";

import { useEffect, useRef, useState } from "react";
import { INKS } from "./inks";
import type { FluidSim } from "./FluidSim";

declare global {
  interface Window {
    /** 除錯用:在正規化座標 (0~1) 滴一滴指定墨色 */
    __suminagashi?: { splat: (x: number, y: number, ink?: number) => void };
  }
}

/**
 * 墨流し互動流體層。
 * three.js 與模擬器皆為動態載入(不進首屏 bundle);
 * prefers-reduced-motion 或 WebGL2 / float RT 不支援時不啟動,
 * 底下的靜態和紙(PaperBackground)就是退場畫面。
 */
export function SuminagashiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simRef = useRef<FluidSim | null>(null);
  const [ready, setReady] = useState(false);
  const [ink, setInkState] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let sim: FluidSim | null = null;

    (async () => {
      const [three, { FluidSim: Sim }] = await Promise.all([
        import("three"),
        import("./FluidSim"),
      ]);
      if (disposed || !canvasRef.current) return;
      sim = new Sim(canvasRef.current, three);
      if (!sim.init()) {
        sim = null;
        return;
      }
      simRef.current = sim;
      sim.dropInitialInk();
      window.__suminagashi = { splat: (x, y, i) => sim?.splatAt(x, y, i) };
      setReady(true);
    })();

    return () => {
      disposed = true;
      sim?.dispose();
      simRef.current = null;
      delete window.__suminagashi;
    };
  }, []);

  function choose(i: number) {
    setInkState(i);
    simRef.current?.setInk(i);
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className={
          "suminagashi-mask pointer-events-none fixed inset-0 -z-10 h-full w-full transition-opacity duration-1000 " +
          (ready ? "opacity-100" : "opacity-0")
        }
      />
      {ready && (
        <div
          role="radiogroup"
          aria-label="選擇墨色"
          className="fixed bottom-5 right-5 z-20 flex items-center gap-2.5 rounded-full border border-line bg-paper/70 px-3.5 py-2.5 backdrop-blur-sm transition-colors duration-300"
        >
          {INKS.map((c, i) => (
            <button
              key={c.hex}
              type="button"
              role="radio"
              aria-checked={i === ink}
              aria-label={`${c.label}色`}
              title={c.label}
              onClick={() => choose(i)}
              className={
                "size-4 rounded-full border border-line transition-transform duration-200 " +
                (i === ink
                  ? "scale-125 ring-1 ring-ink-muted ring-offset-2 ring-offset-paper"
                  : "hover:scale-110")
              }
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      )}
    </>
  );
}
