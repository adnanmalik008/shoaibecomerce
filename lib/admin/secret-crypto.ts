import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

// Authenticated encryption (AES-256-GCM) for the TOTP shared secret so the
// database never stores it in plaintext. The key is derived from a stable
// server-side secret (AUTH_SECRET, or ADMIN_PASSWORD as a fallback) that lives
// only in the environment, keeping it out of any database dump.

const VERSION = "v1";
const FIXED_SALT = "shoaibecommerce-2fa-v1"; // domain separation for the KDF

function key(): Buffer {
  const master = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD;
  if (!master) {
    throw new Error("Cannot encrypt 2FA secret: set AUTH_SECRET (or ADMIN_PASSWORD).");
  }
  // scrypt stretches the env secret into a 32-byte AES key
  return scryptSync(master, FIXED_SALT, 32);
}

/** Encrypt a plaintext string. Returns "v1:ivB64:tagB64:cipherB64". */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12); // 96-bit nonce, standard for GCM
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64"), tag.toString("base64"), ct.toString("base64")].join(":");
}

/** Reverse encryptSecret. Throws if the payload was tampered with or the key changed. */
export function decryptSecret(payload: string): string {
  const [version, ivB64, tagB64, ctB64] = payload.split(":");
  if (version !== VERSION) throw new Error("Unknown 2FA secret format.");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ctB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
