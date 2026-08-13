"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import {
  enrollTotpAction,
  finishSetupAction,
  type EnrollState,
  type FormState,
} from "@/app/admin/actions";
import { useActionNav } from "@/components/admin/useActionNav";
import { Icon } from "@/components/icons";

const initial: EnrollState = { ok: false, message: "" };
const finishInitial: FormState = { ok: false, message: "" };

export function TotpSetupForm({ qrDataUrl, secret }: { qrDataUrl: string; secret: string }) {
  const [state, action, pending] = useActionState(enrollTotpAction, initial);
  const [finishState, finishFormAction, finishPending] = useActionState(
    finishSetupAction,
    finishInitial
  );
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  useActionNav(finishState);

  // Step 2: authenticator confirmed — show recovery codes once, then finish.
  if (state.ok && state.recoveryCodes) {
    const codes = state.recoveryCodes;
    const copyAll = async () => {
      try {
        await navigator.clipboard.writeText(codes.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(false);
      }
    };
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">Save your recovery codes</h2>
          <p className="mt-1 text-sm text-slate-600">
            If you ever lose your phone, each code logs you in once. Store them somewhere safe.
            They will not be shown again.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800">
          {codes.map((c) => (
            <li key={c} className="text-center tracking-wider">{c}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Icon name={copied ? "check" : "link"} className="h-4 w-4" />
          {copied ? "Copied" : "Copy all codes"}
        </button>
        <label className="flex items-start gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300"
          />
          I have saved these recovery codes somewhere safe.
        </label>
        <form action={finishFormAction}>
          <button
            type="submit"
            disabled={!saved || finishPending || Boolean(finishState.next)}
            className="w-full rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {finishPending || finishState.next ? "Opening..." : "Enter the dashboard"}
          </button>
        </form>
      </div>
    );
  }

  // Step 1: scan the QR, then confirm with a live code.
  return (
    <div className="space-y-5">
      <ol className="space-y-1.5 text-sm text-slate-600">
        <li>1. Install Google Authenticator, Authy, or a similar app.</li>
        <li>2. Scan this QR code (or enter the key by hand).</li>
        <li>3. Type the 6-digit code it shows to confirm.</li>
      </ol>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Image src={qrDataUrl} alt="Authenticator setup QR code" width={180} height={180} unoptimized className="h-44 w-44" />
        <div className="text-center">
          <p className="text-xs text-slate-500">Or enter this key manually</p>
          <p className="mt-0.5 break-all font-mono text-sm font-semibold tracking-wider text-slate-800">{secret}</p>
        </div>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="enroll-code" className="mb-1.5 block text-sm font-medium text-slate-700">
            6-digit code from the app
          </label>
          <input
            id="enroll-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]*"
            placeholder="000000"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
        </div>
        {state.message && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
        >
          {pending ? "Confirming..." : "Confirm and continue"}
        </button>
      </form>
    </div>
  );
}
