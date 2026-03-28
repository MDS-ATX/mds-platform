"use client";

import Script from "next/script";

// ─── Follow Up Boss Tracking Pixel ──────────────────────────────────────────
// Place in root layout.tsx to track visitor activity.

interface FUBPixelProps {
  pixelId?: string;
}

export function FUBPixel({ pixelId }: FUBPixelProps) {
  const id = pixelId || process.env.NEXT_PUBLIC_FUB_PIXEL_ID;

  if (!id) return null;

  return (
    <Script
      id="fub-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(d,s,i,r){if(d.getElementById(i)){return}
          var n=d.createElement(s),e=d.getElementsByTagName(s)[0];
          n.id=i;n.src='//cdn.followupboss.com/tracking/stable/fub.min.js';
          n.setAttribute('data-fub-id',r);
          e.parentNode.insertBefore(n,e);})(document,'script','fub-script','${id}');
        `,
      }}
    />
  );
}
