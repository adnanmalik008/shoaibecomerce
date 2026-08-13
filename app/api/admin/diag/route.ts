import { NextResponse } from "next/server";
import { getPool, hasDb } from "@/lib/content-store";

// TEMPORARY runtime diagnostics — DELETE THIS FILE once the Hostinger env
// mangling issue is resolved. Reports only value *shapes* (length, case mix,
// whitespace), never the values themselves. Gated by a random token that
// exists only in this file and the operator's session.

const DIAG_TOKEN = "cvzkdss1l2sycan3a1djhzv6jhw3c3pr";

function shape(name: string) {
  const v = process.env[name];
  if (v === undefined) return { present: false };
  return {
    present: true,
    len: v.length,
    trimmedLen: v.trim().length,
    hasUpper: /[A-Z]/.test(v),
    hasLower: /[a-z]/.test(v),
    firstChar: v.trim().slice(0, 1), // enough to spot quoting mistakes, not secret
  };
}

export async function GET(req: Request) {
  if (req.headers.get("x-diag-token") !== DIAG_TOKEN) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const out: Record<string, unknown> = {
    node: process.version,
    env: {
      DB_HOST: shape("DB_HOST"),
      DB_PORT: shape("DB_PORT"),
      DB_NAME: shape("DB_NAME"),
      DB_USER: shape("DB_USER"),
      DB_PASSWORD: shape("DB_PASSWORD"),
      ADMIN_PASSWORD: shape("ADMIN_PASSWORD"),
      AUTH_SECRET: shape("AUTH_SECRET"),
      NEXT_PUBLIC_SITE_URL: shape("NEXT_PUBLIC_SITE_URL"),
    },
    hasDb: hasDb(),
  };

  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT 1 AS ok");
    out.db = { ok: true, rows };
  } catch (err) {
    const e = err as NodeJS.ErrnoException & { sqlMessage?: string };
    out.db = { ok: false, code: e.code, message: e.sqlMessage || e.message };
  }

  try {
    const QRCode = (await import("qrcode")).default;
    await QRCode.toDataURL("diag-test", { margin: 1, width: 64 });
    out.qrcode = { ok: true };
  } catch (err) {
    out.qrcode = { ok: false, message: err instanceof Error ? err.message : String(err) };
  }

  return NextResponse.json(out);
}
