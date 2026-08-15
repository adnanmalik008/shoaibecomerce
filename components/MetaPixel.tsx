"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Loads the Meta Pixel and keeps PageView accurate across App Router
// navigations. Rendered only when the admin has configured a pixel ID, and
// never on /admin so the operator's own editing doesn't pollute the data.
// Loading is not gated on the visitor: TrackingNotice informs them and links
// to the privacy policy, but the pixel runs regardless of whether it is
// dismissed.

export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const active = !pathname.startsWith("/admin");

  // Client-side navigations don't reload the page, so the snippet's initial
  // PageView only covers the landing. Track the rest here. The base snippet
  // fires the first PageView itself; skipping the initial pathname would race
  // against script load, so this fires once more on the landing page — Meta
  // dedupes same-URL PageViews itself.
  useEffect(() => {
    if (!active) return;
    window.fbq?.("track", "PageView");
  }, [active, pathname]);

  if (!active) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
    </Script>
  );
}
