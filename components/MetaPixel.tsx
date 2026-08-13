"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, getConsent } from "@/lib/tracking";

// Loads the Meta Pixel and keeps PageView accurate across App Router
// navigations. Rendered only when the admin has configured a pixel ID; loads
// nothing until the visitor grants consent (see ConsentBanner).

export function MetaPixel({ pixelId }: { pixelId: string }) {
  const [consented, setConsented] = useState(false);
  const pathname = usePathname();

  // Read the stored choice after mount (localStorage doesn't exist on the
  // server) and react to the banner's buttons without a reload.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (getConsent() === "granted") setConsented(true);
    const onChange = (e: Event) => {
      if ((e as CustomEvent).detail === "granted") setConsented(true);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Client-side navigations don't reload the page, so the snippet's initial
  // PageView only covers the landing. Track the rest here. The base snippet
  // fires the first PageView itself; skipping the initial pathname would race
  // against script load, so this fires once more on the landing page — Meta
  // dedupes same-URL PageViews itself.
  useEffect(() => {
    if (!consented) return;
    window.fbq?.("track", "PageView");
  }, [consented, pathname]);

  if (!consented || pathname.startsWith("/admin")) return null;

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
