"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/content";
import { Icon } from "./icons";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 flex flex-wrap items-center gap-2">
        <span className="break-all font-mono text-base font-semibold tracking-wide text-slate-900">{value}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          {copied ? (
            <>
              <Icon name="check" className="h-3.5 w-3.5 text-emerald-500" />
              Copied
            </>
          ) : (
            "Copy"
          )}
        </button>
      </dd>
    </div>
  );
}

type Zoom = { src: string; alt: string } | null;

function QrThumb({
  src,
  alt,
  caption,
  onZoom,
}: {
  src: string;
  alt: string;
  caption: string;
  onZoom: (z: Zoom) => void;
}) {
  return (
    <figure className="mx-auto shrink-0 text-center @md:mx-0">
      <button
        type="button"
        onClick={() => onZoom({ src, alt })}
        aria-label={`Zoom ${alt}`}
        className="group relative block overflow-hidden rounded-lg border border-slate-200 transition-shadow hover:shadow-md"
      >
        <Image src={src} alt={alt} width={200} height={200} className="h-auto w-32 sm:w-36" />
        <span className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <span className="mb-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
            Tap to zoom
          </span>
        </span>
      </button>
      <figcaption className="mt-1.5 text-xs text-slate-500">{caption}</figcaption>
    </figure>
  );
}

// provider logos shipped in /public/logos, matched against card labels; a
// card shows every match, so the combined wallets card gets all three. The
// square app logos need more height than the wide bank wordmark.
const LOGOS: { match: RegExp; src: string; alt: string; cls: string }[] = [
  { match: /easypaisa/i, src: "/logos/easypaisa.png", alt: "Easypaisa", cls: "h-12" },
  { match: /jazzcash/i, src: "/logos/jazzcash.png", alt: "JazzCash", cls: "h-12" },
  { match: /nayapay/i, src: "/logos/nayapay.png", alt: "NayaPay", cls: "h-11" },
  { match: /sadapay/i, src: "/logos/sadapay.png", alt: "SadaPay", cls: "h-14" },
  { match: /faysal/i, src: "/logos/faysalbank.png", alt: "Faysal Bank", cls: "h-9" },
];

function logosFor(label: string) {
  return LOGOS.filter((l) => l.match.test(label));
}

function MethodCard({
  title,
  logos = [],
  children,
}: {
  title: string;
  logos?: { src: string; alt: string; cls: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="@container rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        {logos.length > 0 && (
          <span className="flex items-center gap-2.5">
            {logos.map((logo) => (
              <Image
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                width={160}
                height={64}
                className={`${logo.cls} w-auto object-contain`}
              />
            ))}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function PaymentDetails({ payment }: { payment: SiteContent["payment"] }) {
  const { bank, wallets, binance, note } = payment;
  const [zoom, setZoom] = useState<Zoom>(null);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoom]);

  return (
    // container queries: the grid and card layouts follow the width available
    // to this block (narrow on the enroll page, wide on the home section),
    // not the viewport, so cards never get crushed into cramped columns
    <div className="@container space-y-4">
      <div className="grid gap-4 @2xl:grid-cols-2">
        {/* Bank transfer */}
        <MethodCard title="Bank transfer" logos={logosFor(bank.provider)}>
          <div className="mt-4 flex flex-col gap-5 @md:flex-row @md:items-start @md:justify-between">
            <dl className="min-w-0 space-y-3">
              <div>
                <dt className="text-xs text-slate-500">Bank</dt>
                <dd className="font-medium text-slate-900">{bank.provider}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Account title</dt>
                <dd className="font-medium text-slate-900">{bank.accountName}</dd>
              </div>
              <CopyRow label="IBAN" value={bank.iban} />
              <CopyRow label="Account number" value={bank.accountNumber} />
            </dl>
            {bank.qr && (
              <QrThumb
                src={bank.qr}
                alt={`Payment QR code for ${bank.accountName}`}
                caption="Scan to pay"
                onZoom={setZoom}
              />
            )}
          </div>
        </MethodCard>

        {/* Binance Pay */}
        {binance?.id && (
          <MethodCard title="Binance Pay">
            <div className="mt-4 flex flex-col gap-5 @md:flex-row @md:items-start @md:justify-between">
              <dl className="min-w-0 space-y-3">
                <div>
                  <dt className="text-xs text-slate-500">Account name</dt>
                  <dd className="font-medium text-slate-900">{binance.accountName}</dd>
                </div>
                <CopyRow label="Binance ID" value={binance.id} />
              </dl>
              {binance.qr && (
                <QrThumb
                  src={binance.qr}
                  alt={`Binance Pay QR code for ${binance.accountName}`}
                  caption="Scan with the Binance app"
                  onZoom={setZoom}
                />
              )}
            </div>
          </MethodCard>
        )}

        {/* Mobile wallets */}
        {wallets.map((w) => (
          <MethodCard key={w.label} title={w.label} logos={logosFor(w.label)}>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-xs text-slate-500">Account name</dt>
                <dd className="font-medium text-slate-900">{w.accountName}</dd>
              </div>
              <CopyRow label="Account number" value={w.number} />
            </dl>
          </MethodCard>
        ))}
      </div>

      {note && (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{note}</p>
      )}

      {/* QR zoom lightbox */}
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
          onClick={() => setZoom(null)}
        >
          <button
            type="button"
            onClick={() => setZoom(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom.src}
            alt={zoom.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-auto max-w-full rounded-2xl bg-white object-contain p-2 shadow-2xl sm:max-w-md"
          />
        </div>
      )}
    </div>
  );
}
