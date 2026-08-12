import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { LeadForm } from "@/components/LeadForm";
import { PaymentDetails } from "@/components/PaymentDetails";
import { SupportTeam } from "@/components/SupportTeam";
import { getContent } from "@/lib/content";
import { enrollSteps } from "@/lib/site";

export const metadata: Metadata = {
  title: "Enroll in the 30-Day Instagram eCommerce Course",
  description:
    "Reserve your seat in the next Instagram eCommerce batch for Rs. 15,000. Bank payment details, enrollment steps, and WhatsApp support team on one page.",
  alternates: { canonical: "/enroll" },
  openGraph: {
    title: "Enroll in the 30-Day Instagram eCommerce Course",
    description:
      "Reserve your seat in the next batch for Rs. 15,000. Enrollment happens on WhatsApp in four steps.",
    url: "/enroll",
    images: ["/og.jpg"],
  },
};

export default async function EnrollPage() {
  const { pricing, guarantee, whatsapp, payment } = await getContent();

  return (
    <>
      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
          {/* Left: pitch + steps */}
          <div>
            <p className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Only {pricing.seatsLeft} seats in this batch
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Reserve your seat
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              The full 30-day training is{" "}
              <span className="font-semibold text-slate-900">
                {pricing.currency} {pricing.current.toLocaleString()}
              </span>{" "}
              <span className="text-slate-400 line-through">
                {pricing.currency} {pricing.original.toLocaleString()}
              </span>
              . Enrollment happens on WhatsApp in four steps:
            </p>

            <ol className="mt-8 space-y-4">
              {enrollSteps.map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-slate-700">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10">
              <PaymentDetails payment={payment} />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold text-slate-900">
                Not ready to enroll yet?
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Join the free WhatsApp community for daily updates and student
                results.
              </p>
              <a
                href={whatsapp.community}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-whatsapp-dark hover:underline"
              >
                <Icon name="whatsapp" className="h-5 w-5" />
                Join the community
              </a>
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Start your enrollment
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              We&apos;ll continue the conversation on WhatsApp.
            </p>
            <div className="mt-6">
              <LeadForm whatsappNumber={whatsapp.number} />
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
              <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm leading-relaxed text-emerald-800">{guarantee}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Support team */}
      <section id="support" className="scroll-mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Talk to our support team
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Not sure about something? Message any of the team on WhatsApp.
              They answer every day.
            </p>
          </div>
          <div className="mt-12">
            <SupportTeam />
          </div>
        </div>
      </section>
    </>
  );
}
