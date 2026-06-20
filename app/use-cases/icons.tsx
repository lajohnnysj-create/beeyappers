import type { ReactNode } from "react";

// Decorative stroke glyphs used across the use-case pages and the nav dropdown.
// Stylized, not brand logos. Always rendered aria-hidden.
const PATHS: Record<string, ReactNode> = {
  headset: (
    <>
      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
      <rect x="2.5" y="13.5" width="4" height="6.5" rx="1.5" />
      <rect x="17.5" y="13.5" width="4" height="6.5" rx="1.5" />
      <path d="M21 19.5a3 3 0 0 1-3 3h-3" />
    </>
  ),
  funnel: <path d="M3 4h18l-7 8.5V20l-4 1.5v-9z" />,
  cart: (
    <>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="19" cy="20" r="1.4" />
      <path d="M2 3h3l2.4 12a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L22 7H6" />
    </>
  ),
  tooth: (
    <path d="M12 5.4c-1.8-1.9-4.6-2.4-6.2-1C4 6 4 9 4.9 12.4 5.6 15 5.8 19 7.2 20c1.2.8 1.7-1.4 2.2-3.2.3-1.1.6-2 1.6-2s1.3.9 1.6 2c.5 1.8 1 4 2.2 3.2 1.4-1 1.6-5 2.3-7.6C18 9 18 6 16.2 4.4c-1.6-1.4-4.4-.9-6.2 1z" />
  ),
  heart: (
    <>
      <path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 22l8.8-8.3a5 5 0 0 0 0-7.1z" />
      <path d="M3.6 12h2.9l1.4-2.7L10 14l1.6-3h3" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.4V21h14V9.4" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  wrench: (
    <path d="M14.6 6.3a3.9 3.9 0 0 1 5.1-5.1l-2.6 2.6 1.9 1.9 2.6-2.6a3.9 3.9 0 0 1-5.1 5.1L6.4 17.6a2.8 2.8 0 1 1-4-4z" />
  ),
  utensils: (
    <>
      <path d="M5 3v6a2 2 0 0 0 4 0V3" />
      <path d="M7 9v12" />
      <path d="M16.5 3c-1.7 0-2.7 2-2.7 4.6S15 12 16.5 12v9" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  megaphone: (
    <>
      <path d="m3 11 14-6v14L3 13z" />
      <path d="M3 11v2a1 1 0 0 0 1 1h2v-4H4a1 1 0 0 0-1 1z" />
      <path d="M9.5 14v4.5a2 2 0 0 0 4 0V15" />
    </>
  ),
  graduation: (
    <>
      <path d="M22 9 12 5 2 9l10 4 10-4z" />
      <path d="M6 11v4c0 1.4 2.7 3 6 3s6-1.6 6-3v-4" />
      <path d="M22 9v6" />
    </>
  ),
  store: (
    <>
      <path d="M3.5 9 5 4h14l1.5 5" />
      <path d="M4 9v11h16V9" />
      <path d="M3.5 9a2.8 2.8 0 0 0 5.5 0 2.8 2.8 0 0 0 6 0 2.8 2.8 0 0 0 5.5 0" />
      <path d="M9.5 20v-5h5v5" />
    </>
  ),
  // Feature icons
  site: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M6.5 6.5h.01M9 6.5h.01" />
    </>
  ),
  languages: (
    <>
      <path d="M4 5h7" />
      <path d="M7 4v1c0 4-2 7-5 8" />
      <path d="M5 9c0 2.5 2.5 4.5 6 5" />
      <path d="m13 20 4-9 4 9" />
      <path d="M14.5 17h5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.6 0 1.9-1.2 1.1-2.1-.8-.9-.3-2.2 1-2.2H17a4 4 0 0 0 4-4 9 9 0 0 0-9-9z" />
      <circle cx="7.5" cy="11.5" r="1" />
      <circle cx="10" cy="7.5" r="1" />
      <circle cx="14.5" cy="7.5" r="1" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
};

export function UCIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] ?? PATHS.layers}
    </svg>
  );
}
