import Image from "next/image";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { legalNav, nav, site, wordmark } from "@/lib/site";
import { Icon } from "./icons";

export async function Footer() {
  const { socials, whatsapp, sectionVisibility } = await getContent();
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="flex items-center gap-2.5 font-display text-lg font-bold text-slate-900">
              <Image
                src="/logo.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg"
              />
              <span>
                {wordmark.first}
                <span className="text-slate-400"> {wordmark.rest}</span>
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-500">{site.tagline}</p>
            <p className="mt-4 text-sm text-slate-500">
              Live Instagram eCommerce training. Learn, launch, and earn in 30
              days.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2">
            {[
              ...nav,
              { label: "Enroll", href: "/enroll" },
              // #support only exists while the support team section is visible
              ...(sectionVisibility.supportTeam
                ? [{ label: "Support", href: "/enroll#support" }]
                : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-4">
            <a
              href={whatsapp.community}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-whatsapp-dark"
            >
              <Icon name="whatsapp" className="h-5 w-5" />
              Join WhatsApp Community
            </a>

            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  <Icon name={s.icon} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-slate-400 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
