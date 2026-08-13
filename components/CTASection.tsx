import Link from "next/link";
import { getContent } from "@/lib/content";

export async function CTASection({
  title = "Ready to launch your Instagram business?",
  subtitle = "Seats run out every batch. Join this one and start learning live.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const { pricing, sectionVisibility } = await getContent();
  if (!sectionVisibility.finalCta) return null;

  return (
    <section className="bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/enroll"
            className="w-full rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100 sm:w-auto"
          >
            Enroll Now for {pricing.currency} {pricing.current.toLocaleString()}
          </Link>
          <Link
            href="/course"
            className="w-full rounded-lg border border-slate-600 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto"
          >
            See what&apos;s inside
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Only {pricing.seatsLeft} seats in this batch · Live classes · Lifetime support
        </p>
      </div>
    </section>
  );
}
