import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { adminConfigured, isAuthed } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAuthed()) redirect("/admin");

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
          <Image src="/logo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-xl" />
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Step 1 of 2. Enter your password to continue.
          </p>
          {adminConfigured() ? (
            <div className="mt-6">
              <LoginForm />
            </div>
          ) : (
            <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              Admin is not set up yet. Add an <code className="font-mono">ADMIN_PASSWORD</code> line
              to the server&apos;s <code className="font-mono">.env</code> file, then restart the app.
            </p>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Changes made here publish straight to shoaibecomerce.com
        </p>
      </div>
    </div>
  );
}
