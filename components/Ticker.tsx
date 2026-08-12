import Link from "next/link";

export function Ticker({ messages }: { messages: string[] }) {
  // Doubled so the marquee loops seamlessly at -50% translate.
  const items = [...messages, ...messages];

  return (
    <div className="overflow-hidden bg-slate-900 py-2">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] motion-reduce:animate-none motion-reduce:justify-center">
        {items.map((msg, i) => (
          <Link
            key={i}
            href="/enroll"
            className="flex shrink-0 items-center gap-2 px-6 text-sm font-medium text-white"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
            {msg}
          </Link>
        ))}
      </div>
    </div>
  );
}
