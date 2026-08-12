import Link from "next/link";
import { getContent } from "@/lib/content";
import { included } from "@/lib/site";
import { Icon } from "./icons";

export async function PricingCard() {
  const { pricing, guarantee } = await getContent();
  const discount =
    pricing.original > pricing.current
      ? Math.round(((pricing.original - pricing.current) / pricing.original) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Complete 30-day training
        </p>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Only {pricing.seatsLeft} seats left
        </span>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <p className="font-display text-5xl font-bold tracking-tight text-slate-900">
          {pricing.currency} {pricing.current.toLocaleString()}
        </p>
        {discount > 0 && (
          <p className="pb-1.5 text-lg text-slate-400 line-through">
            {pricing.currency} {pricing.original.toLocaleString()}
          </p>
        )}
      </div>
      {discount > 0 && (
        <p className="mt-1 text-sm font-medium text-emerald-600">
          Save {discount}% with the limited-time batch price
        </p>
      )}

      <ul className="mt-8 space-y-3">
        {included.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            {item}
          </li>
        ))}
      </ul>

      <Link
        href="/enroll"
        className="mt-8 block rounded-lg bg-slate-900 px-6 py-3.5 text-center text-base font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
      >
        Reserve your seat
      </Link>
      <p className="mt-3 text-center text-xs text-slate-400">
        One-time fee · Pay via bank transfer, confirm on WhatsApp
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
        <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <p className="text-sm leading-relaxed text-emerald-800">{guarantee}</p>
      </div>
    </div>
  );
}
