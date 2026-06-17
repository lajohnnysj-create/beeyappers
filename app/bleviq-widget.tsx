"use client";

import { useEffect } from "react";

const WIDGET_SRC = "https://www.bleviq.com/widget.js";
const WIDGET_KEY = "wk_076f49ce05c5423facb638945deaa9b7";

type BleviqGlobal = {
  __bleviqWidget?: { destroy?: () => void } | null;
  __bleviqCancelled?: boolean;
};

/**
 * Loads Bleviq's own chat widget on our marketing pages (dogfooding) and, just
 * as importantly, removes it again on unmount. The loader injects an iframe
 * straight into <body>, outside React, so without this teardown the widget
 * would persist across client-side navigation onto pages that don't embed it
 * (most visibly, the dashboard).
 */
export function BleviqWidget() {
  useEffect(() => {
    const w = window as unknown as BleviqGlobal;
    w.__bleviqCancelled = false;

    const s = document.createElement("script");
    s.src = WIDGET_SRC;
    s.async = true;
    s.setAttribute("data-widget-key", WIDGET_KEY);
    document.body.appendChild(s);

    return () => {
      // If the loader already ran, tear the widget down cleanly. If it hasn't
      // finished loading yet, flag it so it no-ops when it does.
      if (w.__bleviqWidget?.destroy) w.__bleviqWidget.destroy();
      else w.__bleviqCancelled = true;
      s.remove();
    };
  }, []);

  return null;
}
