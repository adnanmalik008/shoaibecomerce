import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { Icon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { personSchema } from "@/lib/schema";
import { features, instructor, stats } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Shoaib Zareen, Instagram eCommerce Trainer",
  description:
    "Shoaib Zareen built a multi-million dollar Instagram business, then trained 50,000+ students across Pakistan to earn online. Meet the trainer behind the course.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Shoaib Zareen, Instagram eCommerce Trainer",
    description:
      "He built his own Instagram business first, then trained 50,000+ students to do the same.",
    url: "/about",
    images: ["/og.jpg"],
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={personSchema} />
      {/* Instructor hero */}
      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.6fr]">
          <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-3xl shadow-xl shadow-slate-300 lg:h-72 lg:w-72">
            <Image
              src="/shoaib-zareen.jpg"
              alt={`${instructor.name}, Instagram eCommerce trainer and founder of Shoaib Ecommerce`}
              fill
              priority
              sizes="(min-width: 1024px) 288px, 224px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {instructor.role}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {instructor.name}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              {instructor.bio}
            </p>
            <blockquote className="mt-8 border-l-4 border-slate-900 pl-5 font-display text-2xl font-semibold text-slate-900">
              &ldquo;{instructor.quote}&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-slate-200 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
          {stats.map((s) => (
            <div key={s.label} className="py-10 text-center">
              <p className="font-display text-4xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-2 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            The track record
          </h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
            {instructor.milestones.map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Why this course exists
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Most people in Pakistan who want to earn online hit the same walls:
            no money for stock, no way to handle delivery, no budget for ads.
            Shoaib built this training to knock those walls down. What is left
            between a student and their first commission is showing up to the{" "}
            <Link href="/course" className="font-semibold text-slate-900 underline underline-offset-4">four live classes</Link>{" "}
            and doing the work.
          </p>
        </div>
      </section>

      {/* Problem / promise */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Most online-earning courses leave you on your own.
              <span className="text-slate-400"> This one doesn&apos;t.</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              You bring the customers. Everything else, from products to delivery,
              is already set up for you.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Icon name={f.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Learn directly from Shoaib"
        subtitle="Join the next live batch and ask your questions in class, not through recordings."
      />
    </>
  );
}
