"use client";

import Script from "next/script";

// ─── Follow Up Boss Widget Tracker ──────────────────────────────────────────
// Place in root layout.tsx to track visitor activity.

interface FUBPixelProps {
  widgetId?: string;
}

export function FUBPixel({ widgetId }: FUBPixelProps) {
  const id = widgetId || process.env.NEXT_PUBLIC_FUB_WIDGET_ID;

  if (!id) return null;

  return (
    <Script
      id="fub-widget-tracker"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,i,d,g,e,t){w["WidgetTrackerObject"]=g;(w[g]=w[g]||function()
          {(w[g].q=w[g].q||[]).push(arguments);}),(w[g].ds=1*new Date());(e="script"),
          (t=d.createElement(e)),(e=d.getElementsByTagName(e)[0]);t.async=1;t.src=i;
          e.parentNode.insertBefore(t,e);})(window,"https://widgetbe.com/agent",document,"widgetTracker");
          window.widgetTracker("create", "${id}");
          window.widgetTracker("send", "pageview");
        `,
      }}
    />
  );
}
