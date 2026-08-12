import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import { ScreenshotTestimonials } from "@/components/ScreenshotTestimonials";
import { getContent } from "@/lib/content";
import { stats } from "@/lib/site";

export const metadata: Metadata = {
  title: "Student Success Stories and Real Earnings",
  description:
    "Real payment screenshots and messages from students of the 30-day Instagram eCommerce course in Pakistan: first commissions, steady orders, income without inventory.",
  alternates: { canonical: "/success-stories" },
  openGraph: {
    title: "Student Success Stories and Real Earnings",
    description:
      "Real payment screenshots and messages from students of the 30-day Instagram eCommerce course.",
    url: "/success-stories",
    images: ["/og.jpg"],
  },
};

export default async function SuccessStoriesPage() {
  const { galleries } = await getContent();

  return (
    <>
      {/* Header + stats banner */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Success stories
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              They started with a phone. That&apos;s it.
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              Students across Pakistan have used this exact system to earn their
              first online income. No inventory, no ads, and for most of them,
              no experience either.
            </p>
          </div>

          <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-white px-6 py-8 text-center">
                <dd className="font-display text-3xl font-bold text-slate-900">
                  {s.value}
                </dd>
                <dt className="mt-1 text-sm text-slate-500">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Student payouts */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {galleries.payouts.heading}
          </h2>
          {galleries.payouts.subheading && (
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-500">
              {galleries.payouts.subheading}
            </p>
          )}
        </div>
        <div className="mt-10 pb-16 sm:pb-20">
          <ScreenshotTestimonials
            images={galleries.payouts.images}
            altLabel="Payout sent to a student screenshot"
          />
        </div>
      </section>

      {/* Student earnings */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {galleries.earnings.heading}
          </h2>
          {galleries.earnings.subheading && (
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-500">
              {galleries.earnings.subheading}
            </p>
          )}
        </div>
        <div className="mt-10 pb-16 sm:pb-20">
          <ScreenshotTestimonials
            images={galleries.earnings.images}
            altLabel="Student earnings screenshot"
          />
        </div>
      </section>

      {/* Training testimonials */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {galleries.training.heading}
          </h2>
          {galleries.training.subheading && (
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-500">
              {galleries.training.subheading}
            </p>
          )}
        </div>
        <div className="mt-10 pb-16 sm:pb-20">
          <ScreenshotTestimonials
            images={galleries.training.images}
            altLabel="Student training feedback screenshot"
          />
        </div>
      </section>

      <CTASection
        title="You could be the next story"
        subtitle="Everyone on this page started with zero experience. The next batch is open now."
      />
    </>
  );
}
