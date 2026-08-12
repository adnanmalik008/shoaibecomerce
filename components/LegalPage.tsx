import Link from "next/link";
import { getContent } from "@/lib/content";
import { waHref } from "@/lib/wa";

// Shared renderer for the legal pages (privacy, terms, refunds). Content is
// passed in as plain data so all three pages stay visually identical.

type Block = string | { list: string[] };
export type LegalSection = { heading: string; blocks: Block[] };

export async function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  const { whatsapp } = await getContent();
  const phoneDisplay = `+${whatsapp.number}`;

  return (
    <>
      <section className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">{intro}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          {sections.map((s, i) => (
            <div key={s.heading} className={i === 0 ? undefined : "mt-10"}>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                {i + 1}. {s.heading}
              </h2>
              {s.blocks.map((block, j) =>
                typeof block === "string" ? (
                  <p key={j} className="mt-4 leading-relaxed text-slate-600">
                    {block}
                  </p>
                ) : (
                  <ul
                    key={j}
                    className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-slate-600"
                  >
                    {block.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )
              )}
            </div>
          ))}

          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Questions about this policy?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Message our support team on WhatsApp at{" "}
              <a
                href={waHref(whatsapp.number, `Hi! I have a question about your ${title.toLowerCase()}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-900 underline underline-offset-4"
              >
                {phoneDisplay}
              </a>{" "}
              or reach any of the team members listed on the{" "}
              <Link
                href="/enroll#support"
                className="font-semibold text-slate-900 underline underline-offset-4"
              >
                support section
              </Link>
              . We reply every day.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
