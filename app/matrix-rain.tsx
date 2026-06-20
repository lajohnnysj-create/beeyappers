"use client";

import { useEffect, useRef } from "react";

// Half-width katakana + code glyphs; align well in a monospace cell.
const CHARS =
  "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇ0123456789</>{}[]=+*-#%".split("");

export function MatrixRain({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv0 = ref.current;
    if (!cv0) return;
    const g0 = cv0.getContext("2d");
    if (!g0) return;
    const cv: HTMLCanvasElement = cv0;
    const g: CanvasRenderingContext2D = g0;

    const fontSize = 14;
    const colGap = fontSize * 2.4; // wider spacing = far fewer columns
    const TRAIL = 7;
    let width = 0;
    let height = 0;
    let cols = 0;

    type Col = { y: number; dir: 1 | -1; alpha: number; active: boolean };
    let columns: Col[] = [];

    function makeCol(): Col {
      const dir: 1 | -1 = Math.random() < 0.35 ? -1 : 1; // ~1/3 rise, rest fall
      return {
        y: dir === 1 ? -Math.random() * height : height + Math.random() * height,
        dir,
        alpha: 0.35 + Math.random() * 0.65,
        active: Math.random() > 0.5, // mostly at rest; just a faint scatter
      };
    }

    function setup() {
      const rect = cv.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.floor(width * dpr);
      cv.height = Math.floor(height * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      g.textBaseline = "top";
      cols = Math.ceil(width / colGap);
      columns = Array.from({ length: cols }, makeCol);
    }

    function frame() {
      g.clearRect(0, 0, width, height); // transparent: lets the image show through
      for (let i = 0; i < cols; i++) {
        const c = columns[i];
        if (!c.active) continue;
        const x = i * colGap + 1;
        for (let k = 0; k < TRAIL; k++) {
          const cy = c.y - c.dir * k * fontSize;
          if (cy < -fontSize || cy > height) continue;
          const fade = 1 - k / TRAIL;
          const ch = CHARS[(Math.random() * CHARS.length) | 0];
          if (k === 0) {
            g.fillStyle = `rgba(199, 210, 254, ${0.8 * c.alpha})`; // bright head
          } else {
            g.fillStyle = `rgba(129, 140, 248, ${0.32 * fade * c.alpha})`; // trail
          }
          g.fillText(ch, x, cy);
        }
      }
    }

    function step() {
      for (let i = 0; i < cols; i++) {
        const c = columns[i];
        if (!c.active) {
          if (Math.random() > 0.992) columns[i] = makeCol();
          continue;
        }
        c.y += c.dir * fontSize;
        const past =
          c.dir === 1
            ? c.y - TRAIL * fontSize > height
            : c.y + TRAIL * fontSize < 0;
        if (past) {
          columns[i] = makeCol();
          if (Math.random() < 0.25) columns[i].active = false; // rest some columns
        }
      }
    }

    setup();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = 0;
    let running = false;
    const STEP_MS = 100;

    function loop(t: number) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (t - last < STEP_MS) return;
      last = t;
      step();
      frame();
    }

    function start() {
      if (running || reduce.matches) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    if (reduce.matches) frame(); // single static frame, no motion
    else start();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0 }
    );
    io.observe(cv);

    const ro = new ResizeObserver(() => {
      setup();
      if (reduce.matches) frame();
    });
    ro.observe(cv);

    const onReduceChange = () => {
      stop();
      setup();
      if (reduce.matches) frame();
      else start();
    };
    reduce.addEventListener?.("change", onReduceChange);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      reduce.removeEventListener?.("change", onReduceChange);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
