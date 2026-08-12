import { faqs } from "@/lib/site";

export function FAQAccordion({ limit }: { limit?: number }) {
  const items = limit ? faqs.slice(0, limit) : faqs;

  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6">
      {items.map((faq) => (
        <details key={faq.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
            {faq.q}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
