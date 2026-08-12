"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/content";

const STORAGE_KEY = "urgency-popup-shown";

export function UrgencyPopup({ pricing }: { pricing: SiteContent["pricing"] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (onAdmin) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const show = () => {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
    };

    // Trigger 1: user scrolls a little after the page loads
    const onScroll = () => {
      if (window.scrollY > 150) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Trigger 2: exit intent — cursor leaves through the top of the viewport
    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) show();
    };
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [onAdmin]);

  if (!open || onAdmin) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="urgency-heading"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Only {pricing.seatsLeft} seats in this batch
        </p>

        <h2
          id="urgency-heading"
          className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Wait, this batch is almost full
        </h2>

        <p className="mt-3 leading-relaxed text-slate-600">
          When the seats fill up, the fee goes back to{" "}
          <span className="font-semibold text-slate-900">
            {pricing.currency} {pricing.original.toLocaleString()}
          </span>
          . Right now it&apos;s{" "}
          <span className="font-semibold text-emerald-600">
            {pricing.currency} {pricing.current.toLocaleString()}
          </span>
          , and that covers the live classes, your products, and delivery.
        </p>

        <Link
          href="/enroll"
          onClick={() => setOpen(false)}
          className="mt-6 block rounded-lg bg-slate-900 px-6 py-3.5 text-center text-base font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
        >
          Reserve my seat for {pricing.currency} {pricing.current.toLocaleString()}
        </Link>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-3 block w-full text-center text-sm text-slate-400 hover:text-slate-600"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
