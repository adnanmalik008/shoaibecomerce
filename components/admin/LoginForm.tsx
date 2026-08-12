"use client";

import { useActionState, useState } from "react";
import { loginAction, type FormState } from "@/app/admin/actions";
import { Icon } from "@/components/icons";

const initial: FormState = { ok: false, message: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-slate-700">
          Password
        </label>
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-base text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <Icon name={show ? "eyeOff" : "eye"} className="h-5 w-5" />
          </button>
        </div>
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
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
