import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { readPending } from "@/lib/admin/auth";
import { isEnrolled } from "@/lib/admin/totp-store";
import { TotpVerifyForm } from "@/components/admin/TotpVerifyForm";

export const metadata: Metadata = {
  title: "Two-factor verification",
  robots: { index: false, follow: false },
};

export default async function TwoFactorPage() {
  const pending = await readPending();
  // must have passed the password step, and an authenticator must exist
  if (!pending || pending.stage !== "verify" || !(await isEnrolled())) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
          <Image src="/logo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-xl" />
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900">
            Enter your code
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Step 2 of 2. Open your authenticator app for the current code.
          </p>
          <div className="mt-6">
            <TotpVerifyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
