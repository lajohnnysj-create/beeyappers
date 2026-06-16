"use client";

import Script from "next/script";

/**
 * Loads Bleviq's own chat widget on our marketing pages (dogfooding).
 * afterInteractive injects the loader after hydration; the loader reads its
 * key from the script tag's data-widget-key attribute.
 */
export function BleviqWidget() {
  return (
    <Script
      src="https://www.bleviq.com/widget.js"
      strategy="afterInteractive"
      {...{ "data-widget-key": "wk_076f49ce05c5423facb638945deaa9b7" }}
    />
  );
}
