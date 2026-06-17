// Bypass-blocks link (WCAG 2.4.1). Rendered as the first focusable element on
// the page by the shared chrome (SiteHeader, dashboard layout). It's hidden
// until focused, then appears top-left and jumps focus to the page's
// <main id="main-content">.
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
    >
      Skip to content
    </a>
  );
}
