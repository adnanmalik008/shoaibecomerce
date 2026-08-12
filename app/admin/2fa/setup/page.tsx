import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { readPending } from "@/lib/admin/auth";
import { isEnrolled } from "@/lib/admin/totp-store";
import { otpauthUrl } from "@/lib/admin/totp";
import { site } from "@/lib/site";
import { TotpSetupForm } from "@/components/admin/TotpSetupForm";

export const metadata: Metadata = {
  title: "Set up two-factor login",
  robots: { index: false, follow: false },
};

export default async function TwoFactorSetupPage() {
  const pending = await readPending();
  if (!pending || pending.stage !== "setup" || !pending.secret) {
    redirect("/admin/login");
  }
  // if an authenticator already exists, this is the verify step, not setup
  if (await isEnrolled()) redirect("/admin/2fa");

  const uri = otpauthUrl(pending.secret, "admin", site.name);
  const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 220 });

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
          <Image src="/logo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-xl" />
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900">
            Protect your admin login
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            One-time setup. From now on you&apos;ll enter a code from your phone after your password.
          </p>
          <div className="mt-6">
            <TotpSetupForm qrDataUrl={qrDataUrl} secret={pending.secret} />
          </div>
        </div>
      </div>
    </div>
  );
}
