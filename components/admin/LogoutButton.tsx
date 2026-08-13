"use client";

import { useActionState } from "react";
import { logoutAction, type FormState } from "@/app/admin/actions";
import { useActionNav } from "@/components/admin/useActionNav";

const initial: FormState = { ok: false, message: "" };

export function LogoutButton() {
  const [state, action, pending] = useActionState(logoutAction, initial);
  useActionNav(state);

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending || Boolean(state.next)}
        className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
      >
        Log out
      </button>
    </form>
  );
}
