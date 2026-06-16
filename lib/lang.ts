// Small, dependency-free language helpers. Safe on client and server.

// Reduce a BCP-47 tag to its primary language subtag: "es-MX" -> "es",
// "zh-Hans" -> "zh", "EN" -> "en". Returns "" when there's nothing usable.
export function baseLang(input?: string | null): string {
  const s = (input || "").trim().toLowerCase();
  if (!s) return "";
  const primary = s.split(/[-_]/)[0];
  return /^[a-z]{2,3}$/.test(primary) ? primary : "";
}

// Human-readable English name for a language code ("es" -> "Spanish"), used to
// give the model an unambiguous target. Falls back to the code itself.
export function languageName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) || code;
  } catch {
    return code;
  }
}

// Right-to-left scripts. The base-code set is small and stable, so a lookup is
// more reliable than feature-detecting Intl.Locale textInfo across browsers.
const RTL_LANGS = new Set([
  "ar", // Arabic
  "he", // Hebrew
  "iw", // Hebrew (legacy code)
  "fa", // Persian / Farsi
  "ur", // Urdu
  "ps", // Pashto
  "sd", // Sindhi
  "yi", // Yiddish
  "dv", // Divehi / Maldivian
  "ckb", // Central Kurdish (Sorani)
  "ug", // Uyghur
  "syr", // Syriac
  "nqo", // N'Ko
  "prs", // Dari
  "arc", // Aramaic
]);

export function isRtlLang(input?: string | null): boolean {
  return RTL_LANGS.has(baseLang(input));
}
