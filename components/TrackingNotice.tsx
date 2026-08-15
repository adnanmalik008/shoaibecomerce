"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dismissNotice, isNoticeDismissed } from "@/lib/tracking";

// Tells visitors that Meta's advertising cookies are in use, and points at the
// privacy policy for the detail and the opt-out. This is notice, not consent:
// the pixel loads either way, so dismissing only hides this bar. Rendered only
// when a pixel ID is configured — with no tracking there is nothing to notice.

export function TrackingNotice() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // The dismissal lives in localStorage, which the server can't see; showing
  // the notice only after mount keeps server and first client render identical.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isNoticeDismissed()) setVisible(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!visible || pathname.startsWith("/admin")) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          We use cookies from Meta to measure our ads and see how visitors use
          this site. See our{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-slate-900 underline underline-offset-4"
          >
            privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0">
          <button
            type="button"
            onClick={() => {
              dismissNotice();
              setVisible(false);
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
