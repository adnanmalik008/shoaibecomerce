"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteContent } from "@/lib/content";

export function StickyEnrollBar({ pricing }: { pricing: SiteContent["pricing"] }) {
  const pathname = usePathname();
  if (pathname === "/enroll" || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">
            <span className="text-slate-400 line-through">
              {pricing.currency} {pricing.original.toLocaleString()}
            </span>{" "}
            Only {pricing.seatsLeft} seats left
          </p>
          <p className="font-display text-lg font-bold text-slate-900">
            {pricing.currency} {pricing.current.toLocaleString()}
          </p>
        </div>
        <Link
          href="/enroll"
          className="shrink-0 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
        >
          Enroll Now
        </Link>
      </div>
    </div>
  );
}
