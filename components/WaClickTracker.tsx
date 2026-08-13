"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackLead } from "@/lib/tracking";

// Every conversion on this site is a WhatsApp handoff, so a Meta "Lead" is
// "visitor left for WhatsApp". One delegated listener catches every WhatsApp
// anchor — support team cards, the FAB, legal pages, the community link —
// without turning each server component into a client one. The LeadForm opens
// WhatsApp via window.open and tracks itself.
// trackLead no-ops until the pixel is loaded, so no consent check is needed.

const WA_HOSTS = ["wa.me", "api.whatsapp.com", "chat.whatsapp.com"];

export function WaClickTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!anchor) return;
      try {
        const host = new URL((anchor as HTMLAnchorElement).href).hostname;
        if (WA_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
          trackLead(`whatsapp:${pathname}`);
        }
      } catch {
        // unparseable href — not a WhatsApp link
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
