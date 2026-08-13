import type { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Icon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { PricingCard } from "@/components/PricingCard";
import { getContent } from "@/lib/content";
import { courseSchema, faqSchema } from "@/lib/schema";
import { curriculum, included } from "@/lib/site";

export const metadata: Metadata = {
  title: "30-Day Instagram eCommerce Course with Live Classes",
  description:
    "Learn Instagram eCommerce in Pakistan with 4 live classes over 30 days: store setup, product research, organic marketing, and commission payouts. Rs. 15,000 all included.",
  alternates: { canonical: "/course" },
  openGraph: {
    title: "30-Day Instagram eCommerce Course with Live Classes",
    description:
      "4 live classes over 30 days: store setup, product research, organic marketing, and commission payouts.",
    url: "/course",
    images: ["/og.jpg"],
  },
};

export default async function CoursePage() {
  const { pricing, sectionVisibility } = await getContent();

  return (
    <>
      <JsonLd data={courseSchema(pricing, sectionVisibility.pricing)} />
      {sectionVisibility.faq ? <JsonLd data={faqSchema} /> : null}
      {/* Header */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              The course
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              30 days. 4 live classes. A working business.
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              One live class each week at 10 PM. You build your store, get your
              products, and learn to sell, with a mentor in the room the whole
              way. This is not a folder of recordings.
            </p>
            <p className="mt-3 text-slate-600">
              Not convinced yet? See the{" "}
              <Link
                href="/success-stories"
                className="font-semibold text-slate-900 underline underline-offset-4"
              >
                results students are getting
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Curriculum timeline */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Week-by-week curriculum
          </h2>
          <ol className="mx-auto mt-12 max-w-3xl space-y-0">
            {curriculum.map((week, i) => (
              <li key={week.week} className="relative flex gap-6 pb-12 last:pb-0">
                {i < curriculum.length - 1 && (
                  <span
                    className="absolute left-6 top-14 h-[calc(100%-3.5rem)] w-px bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-white font-display text-sm font-bold text-slate-900">
                  W{week.week}
                </span>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-semibold text-slate-900">
                    {week.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {week.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {week.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm text-slate-600">
                        <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What's included + pricing */}
      {sectionVisibility.pricing ? (
        <section className="bg-slate-50">
          <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything included in your fee
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                One payment, nothing hidden, no upsells later.
              </p>
              <ul className="mt-8 space-y-4">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <PricingCard />
          </div>
        </section>
      ) : null}

      {/* Full FAQ */}
      {sectionVisibility.faq ? (
        <section className="bg-white" id="faq">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Frequently asked questions
            </h2>
            <div className="mt-10">
              <FAQAccordion />
            </div>
          </div>
        </section>
      ) : null}

      <CTASection />
    </>
  );
}
