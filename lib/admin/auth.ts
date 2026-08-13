import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Cookie-session auth for the admin panel.
// ADMIN_PASSWORD env var is the single credential. The session cookie is
// `${expiry}.${hmac(expiry)}` signed with a secret derived from the password
// (or AUTH_SECRET if set), so changing the password invalidates all sessions.

const COOKIE = "admin_session";
const SESSION_DAYS = 7;

// Short-lived cookie for the gap between password entry and the 2FA code.
const PENDING_COOKIE = "admin_2fa_pending";
const PENDING_MINUTES = 10;

// Trimmed only — a trailing newline or stray space in an env row would
// otherwise change every derived value. Case is preserved: the secrets are
// used verbatim as KDF/HMAC input, so all consumers must normalize identically.
const envSecret = (name: string) => (process.env[name] || "").trim();

function secret(): string {
  return envSecret("AUTH_SECRET") || `s:${envSecret("ADMIN_PASSWORD")}`;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function adminConfigured(): boolean {
  return Boolean(envSecret("ADMIN_PASSWORD"));
}

export function checkPassword(password: string): boolean {
  const expected = envSecret("ADMIN_PASSWORD");
  if (!expected) return false;
  return safeEqual(password.trim(), expected);
}

export async function createSession(): Promise<void> {
  const exp = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const store = await cookies();
  store.set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAuthed(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  if (!value) return false;
  const dot = value.lastIndexOf(".");
  if (dot < 1) return false;
  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

// ---- pending 2FA (password verified, second factor not yet) ----

export type PendingStage = "setup" | "verify";
export type Pending = { stage: PendingStage; secret?: string; exp: number };

export async function createPending(data: { stage: PendingStage; secret?: string }): Promise<void> {
  const payload: Pending = { ...data, exp: Date.now() + PENDING_MINUTES * 60 * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const store = await cookies();
  store.set(PENDING_COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_MINUTES * 60,
  });
}

export async function readPending(): Promise<Pending | null> {
  const store = await cookies();
  const value = store.get(PENDING_COOKIE)?.value;
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot < 1) return null;
  const body = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!safeEqual(sig, sign(body))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Pending;
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearPending(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_COOKIE);
}
