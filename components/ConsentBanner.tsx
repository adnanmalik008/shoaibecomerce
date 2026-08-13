"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getConsent, setConsent } from "@/lib/tracking";

// Cookie/tracking consent banner, shown until the visitor makes a choice.
// Only rendered when tracking is configured — without a pixel ID nothing is
// tracked, so there is nothing to consent to and the banner stays away.

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // Consent lives in localStorage, which the server can't see; showing the
  // banner only after mount keeps server and first client render identical.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!visible || pathname.startsWith("/admin")) return null;

  const choose = (granted: boolean) => {
    setConsent(granted ? "granted" : "denied");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
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
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
