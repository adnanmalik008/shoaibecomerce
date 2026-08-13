"use client";

import { useActionState, useState } from "react";
import { verifyRecoveryAction, verifyTotpAction, type FormState } from "@/app/admin/actions";
import { useActionNav } from "@/components/admin/useActionNav";

const initial: FormState = { ok: false, message: "" };

const codeInput =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20";

export function TotpVerifyForm() {
  const [mode, setMode] = useState<"app" | "recovery">("app");
  const [codeState, codeAction, codePending] = useActionState(verifyTotpAction, initial);
  const [recState, recAction, recPending] = useActionState(verifyRecoveryAction, initial);
  useActionNav(codeState);
  useActionNav(recState);

  if (mode === "recovery") {
    return (
      <form action={recAction} className="space-y-4">
        <div>
          <label htmlFor="recovery-code" className="mb-1.5 block text-sm font-medium text-slate-700">
            Recovery code
          </label>
          <input
            id="recovery-code"
            name="code"
            autoFocus
            autoComplete="one-time-code"
            placeholder="xxxx-xxxx"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-mono text-lg tracking-wider text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
        </div>
        {recState.message && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {recState.message}
          </p>
        )}
        <button
          type="submit"
          disabled={recPending}
          className="w-full rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
        >
          {recPending ? "Checking..." : "Use recovery code"}
        </button>
        <button
          type="button"
          onClick={() => setMode("app")}
          className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          Back to authenticator code
        </button>
      </form>
    );
  }

  return (
    <form action={codeAction} className="space-y-4">
      <div>
        <label htmlFor="totp-code" className="mb-1.5 block text-sm font-medium text-slate-700">
          6-digit code
        </label>
        <input
          id="totp-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          pattern="[0-9]*"
          placeholder="000000"
          className={codeInput}
        />
        <p className="mt-2 text-xs text-slate-500">From your authenticator app (Google Authenticator, Authy, etc.).</p>
      </div>
      {codeState.message && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {codeState.message}
        </p>
      )}
      <button
        type="submit"
        disabled={codePending}
        className="w-full rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
      >
        {codePending ? "Verifying..." : "Verify and sign in"}
      </button>
      <button
        type="button"
        onClick={() => setMode("recovery")}
        className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        Lost your phone? Use a recovery code
      </button>
    </form>
  );
}
