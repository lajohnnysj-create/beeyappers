"use client";

import { useEffect, useState } from "react";
import { SignupCtas } from "@/app/signup-ctas";

const WORDS: { word: string; color: string }[] = [
  { word: "chatting", color: "text-indigo-300" },
  { word: "talking", color: "text-sky-300" },
  { word: "vibing", color: "text-fuchsia-300" },
  { word: "chilling", color: "text-cyan-300" },
  { word: "hanging", color: "text-rose-300" },
  { word: "engaging", color: "text-emerald-300" },
  { word: "bonding", color: "text-violet-300" },
  { word: "laughing", color: "text-amber-300" },
  { word: "yapping", color: "text-lime-300" },
  { word: "joking", color: "text-orange-300" },
];

function RotatingWord() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);

  // No pill/box. The word matches the sentence size (text-lg), is bold, and
  // carries a soft glow in its own color (currentColor) so it pops on the dark
  // hero without a button-like frame.
  const base = "text-lg font-bold tracking-tight";

  return (
    <span className="relative mx-1 inline-grid items-baseline align-baseline">
      {/* Every word shares one grid cell, so the slot is always exactly the
          width of the widest word: the sentence never reflows as words swap,
          and no word can overflow into the text beside it. Only the current
          word is shown; the rest stay invisible but still hold the width. */}
      {WORDS.map((w, idx) => (
        <span
          key={w.word}
          aria-hidden={idx !== i}
          className={
            `[grid-area:1/1] text-center ${base} ` +
            (idx === i
              ? `${w.color} animate-bv-word-in [text-shadow:0_0_16px_currentColor]`
              : "invisible")
          }
        >
          {w.word}
        </span>
      ))}
    </span>
  );
}

export function HomeHero() {
  return (
    <section className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-[#070713] lg:min-h-[640px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/herosplash.webp"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      {/* Contrast scrims: an overall darken, a strong left wash where the text
          sits, and a bottom fade so the section blends into the page below. */}
      <div className="absolute inset-0 -z-10 bg-[#070713]/45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#070713] via-[#070713]/85 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#070713] via-[#070713]/40 to-transparent" />

      <div className="mx-auto w-full max-w-5xl px-6 py-20 lg:py-24">
        <div className="mx-auto max-w-xl text-center sm:mx-0 sm:text-left">
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-[52px]">
            24/7 AI Chatbot that works while you sleep
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-200 [text-shadow:0_1px_14px_rgba(0,0,0,0.55)]">
            Add an AI Chatbot that instantly learns your entire website,{" "}
            <br className="hidden sm:block" />
            and start <RotatingWord /> with your visitors.
          </p>

          <SignupCtas />
        </div>
      </div>
    </section>
  );
}
