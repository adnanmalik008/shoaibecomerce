import "server-only";
import { createHmac, randomBytes, randomInt, timingSafeEqual, createHash } from "crypto";

// RFC 6238 TOTP (time-based one-time passwords) for admin 2FA.
// Pure Node crypto — no external dependency. Compatible with Google
// Authenticator, Authy, 1Password, etc. (SHA1, 6 digits, 30s step).

const DIGITS = 6;
const STEP_SECONDS = 30;
const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // RFC 4648, no padding

// ---- base32 ----

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    const idx = B32_ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

// ---- HOTP / TOTP core ----

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  // 64-bit big-endian counter (safe for realistic timestamps)
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 10 ** DIGITS).toString().padStart(DIGITS, "0");
}

/** Counter for a given unix-seconds time (defaults to now). */
export function counterFor(unixSeconds: number = Math.floor(Date.now() / 1000)): number {
  return Math.floor(unixSeconds / STEP_SECONDS);
}

/** The current 6-digit code for a base32 secret. Mainly for tests. */
export function currentToken(secretB32: string, unixSeconds?: number): string {
  return hotp(base32Decode(secretB32), counterFor(unixSeconds));
}

/**
 * Verify a submitted token against the secret within a small time window.
 * Returns the matched counter (so callers can block reuse) or null if invalid.
 * window=1 tolerates one 30s step of clock skew on each side.
 */
export function verifyToken(
  secretB32: string,
  token: string,
  opts: { window?: number; unixSeconds?: number } = {}
): number | null {
  const clean = token.replace(/\D/g, "");
  if (clean.length !== DIGITS) return null;
  const secret = base32Decode(secretB32);
  const center = counterFor(opts.unixSeconds);
  const window = opts.window ?? 1;
  for (let i = -window; i <= window; i++) {
    const counter = center + i;
    if (counter < 0) continue;
    const expected = hotp(secret, counter);
    // constant-time compare of equal-length numeric strings
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(clean))) {
      return counter;
    }
  }
  return null;
}

// ---- secret + recovery codes ----

/** A fresh base32 secret (160 bits, the RFC-recommended length). */
export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

/** otpauth:// URI for QR codes and manual entry. */
export function otpauthUrl(secretB32: string, account: string, issuer: string): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret: secretB32,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Human-friendly one-time recovery codes, e.g. "4f8a-2c9b". */
export function generateRecoveryCodes(count = 8): string[] {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"; // no ambiguous chars
  const make = () =>
    Array.from({ length: 8 }, () => chars[randomInt(chars.length)]).join("");
  return Array.from({ length: count }, () => {
    const s = make();
    return `${s.slice(0, 4)}-${s.slice(4)}`;
  });
}

/** Store only hashes of recovery codes; compare on use. */
export function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(code.trim().toLowerCase()).digest("hex");
}
