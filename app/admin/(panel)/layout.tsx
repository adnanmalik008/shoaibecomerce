import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { dbStatus, storageBackend } from "@/lib/content-store";
import { logoutAction } from "@/app/admin/actions";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthed())) redirect("/admin/login");
  const backend = storageBackend();
  const db = backend === "mysql" ? await dbStatus() : null;
  const badge =
    backend === "file"
      ? { text: "Practice mode: edits may not stick", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" }
      : db?.ok
        ? { text: "Synced", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" }
        : { text: "Saves not working", cls: "bg-red-100 text-red-700", dot: "bg-red-500" };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">
                Admin Dashboard
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.cls}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                {badge.text}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Edit your content below. Changes go live the moment you save.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Icon name="external" className="h-3.5 w-3.5" />
              View site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
        {db && !db.ok && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">Database connection failed. Saves will not work.</p>
            <p className="mt-1 break-all font-mono text-xs">{db.error}</p>
            <p className="mt-2">
              Check DB_NAME, DB_USER (both need the full u289188798_ prefix), DB_PASSWORD, and
              DB_HOST in the .env file, then redeploy.
            </p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
