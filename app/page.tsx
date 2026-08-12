import Image from "next/image";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Icon } from "@/components/icons";
import { PricingCard } from "@/components/PricingCard";
import { ScreenshotTestimonials } from "@/components/ScreenshotTestimonials";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { JsonLd } from "@/components/JsonLd";
import { PaymentDetails } from "@/components/PaymentDetails";
import { getContent } from "@/lib/content";
import { heroVideoSchema } from "@/lib/schema";
import { enrollSteps, fatwa, instructor, stats } from "@/lib/site";

export default async function HomePage() {
  const { hero, pricing, guarantee, videos, payment, galleries, liveClasses, interviews } =
    await getContent();
  const hlStart = hero.highlight ? hero.heading.indexOf(hero.highlight) : -1;

  // show live class clips in batch order; videos with a number come first
  // (ascending), anything without a batch keeps its saved order at the end
  const liveVideosInOrder = [...liveClasses.videos].sort((a, b) => {
    const na = parseInt(a.batch, 10);
    const nb = parseInt(b.batch, 10);
    const aOk = !Number.isNaN(na);
    const bOk = !Number.isNaN(nb);
    if (aOk && bOk) return na - nb;
    if (aOk) return -1;
    if (bOk) return 1;
    return 0;
  });

  return (
    <>
      <JsonLd data={heroVideoSchema(videos.hero.youtubeId)} />
      {/* Hero */}
      <section className="overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-4xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20">
          {hero.badge.trim() && (
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {hero.badge}
            </p>
          )}
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {hlStart < 0 ? (
              hero.heading
            ) : (
              <>
                {hero.heading.slice(0, hlStart)}
                <span className="underline decoration-emerald-500 decoration-4 underline-offset-4">
                  {hero.highlight}
                </span>
                {hero.heading.slice(hlStart + hero.highlight.length)}
              </>
            )}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            {hero.subheading}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/enroll"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
            >
              Enroll Now
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link
              href="/course"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              See the curriculum
            </Link>
          </div>

          <dl className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                  {s.value}
                </dd>
                <dt className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto mt-12 max-w-5xl px-4 pb-16 sm:px-6 sm:pb-24">
          <div
            className="absolute inset-x-6 -inset-y-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-emerald-100 via-white to-slate-100 blur-2xl sm:-inset-y-10"
            aria-hidden="true"
          />
          <YouTubeEmbed id={videos.hero.youtubeId} title={videos.hero.title} />

          {/* Featured on */}
          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 rounded-2xl border-2 border-red-100 bg-white p-6 text-center shadow-lg shadow-red-100/50 sm:flex-row sm:gap-6 sm:text-left">
            <Image
              src="/hum-news.webp"
              alt="HUM News"
              width={130}
              height={84}
              className="h-16 w-auto shrink-0 sm:h-20"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                As seen on national TV
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-900">
                  Shoaib was featured on HUM News
                </span>{" "}
                explaining how ordinary Pakistanis are earning online with
                Instagram eCommerce. The segment is the video above.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Halal fatwa: the single most important trust signal */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-600 to-emerald-700">
        <div
          className="pointer-events-none absolute inset-0 -z-0 opacity-20 [background-image:radial-gradient(circle_at_top,white,transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">
            <Icon name="shield" className="h-8 w-8" />
          </span>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-emerald-100">
            Fatwa verified
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            100% Halal and legit business
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-emerald-50 sm:text-xl">
            {fatwa.summary}
          </p>
          <p className="mt-4 text-sm font-medium text-emerald-100">
            Fatwa No. {fatwa.number}, issued {fatwa.issued} by {fatwa.authority}.
          </p>

          <div className="mx-auto mt-10 max-w-2xl rounded-3xl bg-white p-6 text-left shadow-2xl shadow-emerald-900/30 sm:p-8">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-base font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                Read the full fatwa (Urdu)
                <Icon name="arrow" className="h-5 w-5 shrink-0 rotate-90 text-emerald-600 transition-transform group-open:-rotate-90" />
              </summary>
              <div dir="rtl" lang="ur" className="mt-5 border-t border-slate-200 pt-5 text-right">
                <p className="text-base font-semibold text-slate-800">{fatwa.urduReference}</p>
                <p className="mt-1 text-sm text-slate-500">{fatwa.urduDetail}</p>
                <p className="mt-4 text-base leading-[2.2] text-slate-700">{fatwa.urduText}</p>
                <p lang="ar" className="mt-5 text-sm font-semibold text-slate-500">
                  {fatwa.arabicSource}
                </p>
                <p lang="ar" className="mt-1 text-base leading-loose text-slate-600">
                  {fatwa.arabicText}
                </p>
              </div>
            </details>
          </div>

          <a
            href={fatwa.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-lg transition-colors hover:bg-emerald-50"
          >
            Verify on banuri.edu.pk
            <Icon name="external" className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* TV interviews (hidden until the admin adds some) */}
      {interviews.map((interview, i) => (
        <section
          key={interview.id}
          className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                As seen on national TV
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {interview.title}
              </h2>
            </div>
            <div className="mx-auto mt-10 max-w-3xl">
              <YouTubeEmbed id={interview.id} title={interview.title} />
            </div>
          </div>
        </section>
      ))}

      {/* Main CTA: how to join + payment details */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center rounded-full bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/30">
              Only {pricing.seatsLeft} seats in this batch
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to join? Here&apos;s how
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Four steps and you&apos;re in the next batch. Your seat is one
              payment away.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {enrollSteps.map((step, i) => (
                <li key={step} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10">
              <PaymentDetails payment={payment} />
            </div>
          </div>

          <div className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/enroll"
              className="w-full rounded-lg bg-emerald-500 px-8 py-4 text-center text-lg font-semibold text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-400 sm:w-auto"
            >
              Enroll Now for {pricing.currency} {pricing.current.toLocaleString()}
            </Link>
            <span className="text-sm text-slate-400">
              <span className="line-through">
                {pricing.currency} {pricing.original.toLocaleString()}
              </span>{" "}
              · Batch price
            </span>
          </div>
          <p className="mt-5 text-center text-sm text-slate-400">{guarantee}</p>
        </div>
      </section>

      {/* Watch the training in action */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              See how the training works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Watch this before you enroll to see what happens in the classes, and
              how students go from zero to their first commission.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <YouTubeEmbed id={videos.story.youtubeId} title={videos.story.title} />
          </div>
        </div>
      </section>

      {/* Instructor teaser */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid items-center gap-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12 lg:grid-cols-[1fr_1.5fr]">
            <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full shadow-sm lg:h-48 lg:w-48">
              <Image
                src="/shoaib-zareen.jpg"
                alt={`${instructor.name}, Instagram eCommerce trainer`}
                fill
                sizes="(min-width: 1024px) 192px, 160px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Your trainer
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
                {instructor.name}
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600">{instructor.bio}</p>
              <p className="mt-4 font-display text-lg font-semibold text-slate-900">
                &ldquo;{instructor.quote}&rdquo;
              </p>
              <Link
                href="/about"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
              >
                Read Shoaib&apos;s story
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Student payouts */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {galleries.payouts.heading}
            </h2>
            {galleries.payouts.subheading && (
              <p className="mt-4 text-lg text-slate-600">{galleries.payouts.subheading}</p>
            )}
          </div>
        </div>
        <div className="mt-12 pb-16 sm:pb-20">
          <ScreenshotTestimonials
            images={galleries.payouts.images}
            altLabel="Payout sent to a student screenshot"
          />
        </div>
      </section>

      {/* Student earnings preview */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {galleries.earnings.heading}
            </h2>
            {galleries.earnings.subheading && (
              <p className="mt-4 text-lg text-slate-600">{galleries.earnings.subheading}</p>
            )}
          </div>
        </div>
        <div className="mt-12 pb-16 sm:pb-20">
          <ScreenshotTestimonials
            images={galleries.earnings.images}
            altLabel="Student earnings screenshot"
          />
        </div>
      </section>

      {/* Training testimonials preview */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {galleries.training.heading}
            </h2>
            {galleries.training.subheading && (
              <p className="mt-4 text-lg text-slate-600">{galleries.training.subheading}</p>
            )}
          </div>
        </div>
        <div className="mt-12">
          <ScreenshotTestimonials
            images={galleries.training.images}
            altLabel="Student training feedback screenshot"
          />
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <div className="mt-8 text-center">
            <Link
              href="/success-stories"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              See all success stories
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live class snapshots (hidden until the admin adds videos) */}
      {liveClasses.videos.length > 0 && (
        <section className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {liveClasses.heading}
              </h2>
              {liveClasses.subheading && (
                <p className="mt-4 text-lg text-slate-600">{liveClasses.subheading}</p>
              )}
            </div>
          </div>
          <div className="mt-12 pb-16 sm:pb-20">
            <ScreenshotTestimonials
              images={liveVideosInOrder.map((v) => v.id)}
              labels={liveVideosInOrder.map((v) => v.batch)}
              altLabel="Live class video snapshot"
              video
            />
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="bg-white" id="pricing">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              One fee. Everything included.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Plenty of students earn the fee back on their first few orders.
            </p>
          </div>
          <div className="mt-12">
            <PricingCard />
          </div>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Common questions
            </h2>
          </div>
          <div className="mt-10">
            <FAQAccordion limit={4} />
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/course#faq"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              See all questions
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
