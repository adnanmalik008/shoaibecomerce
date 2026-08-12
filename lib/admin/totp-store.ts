import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { getPool, hasDb } from "@/lib/content-store";
import { hashRecoveryCode } from "./totp";
import { decryptSecret, encryptSecret } from "./secret-crypto";

// Persistence for admin 2FA: the TOTP secret, hashed recovery codes, the last
// consumed counter (blocks code reuse), and login throttling. Reuses the same
// MySQL pool as the content store; falls back to a local JSON file for dev.

export type Enrollment = {
  secret: string;
  recovery: { hash: string; used: boolean }[];
  lastCounter: number;
};

type Throttle = { fails: number; lockUntil: number };

const FILE = path.join(process.cwd(), ".data", "admin-2fa.json");

type FileShape = { enrollment?: Enrollment; throttle?: Throttle };

async function readFile(): Promise<FileShape> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeFile(data: FileShape) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf8");
}

let tableReady = false;
async function db() {
  const pool = await getPool();
  if (!tableReady) {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS admin_2fa (
        id TINYINT NOT NULL PRIMARY KEY,
        secret VARCHAR(255) NOT NULL,
        recovery MEDIUMTEXT NOT NULL,
        last_counter BIGINT NOT NULL DEFAULT 0,
        fails INT NOT NULL DEFAULT 0,
        lock_until BIGINT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4`
    );
    tableReady = true;
  }
  return pool;
}

// ---- enrollment ----

export async function getEnrollment(): Promise<Enrollment | null> {
  if (hasDb()) {
    const pool = await db();
    const [rows] = await pool.query(
      "SELECT secret, recovery, last_counter FROM admin_2fa WHERE id = 1"
    );
    const row = (rows as { secret: string; recovery: string; last_counter: number }[])[0];
    if (!row) return null;
    return {
      secret: decryptSecret(row.secret),
      recovery: JSON.parse(row.recovery),
      lastCounter: Number(row.last_counter),
    };
  }
  const stored = (await readFile()).enrollment ?? null;
  if (!stored) return null;
  return { ...stored, secret: decryptSecret(stored.secret) };
}

export async function isEnrolled(): Promise<boolean> {
  try {
    return (await getEnrollment()) !== null;
  } catch {
    return false;
  }
}

/** Save a new enrollment. Recovery codes are hashed here; plaintext is shown once by the caller. */
export async function saveEnrollment(secret: string, recoveryCodes: string[]): Promise<void> {
  const recovery = recoveryCodes.map((c) => ({ hash: hashRecoveryCode(c), used: false }));
  const encrypted = encryptSecret(secret); // never persist the plaintext secret
  if (hasDb()) {
    const pool = await db();
    await pool.query(
      `INSERT INTO admin_2fa (id, secret, recovery, last_counter, fails, lock_until)
       VALUES (1, ?, ?, 0, 0, 0)
       ON DUPLICATE KEY UPDATE secret = VALUES(secret), recovery = VALUES(recovery),
       last_counter = 0, fails = 0, lock_until = 0`,
      [encrypted, JSON.stringify(recovery)]
    );
    return;
  }
  const data = await readFile();
  data.enrollment = { secret: encrypted, recovery, lastCounter: 0 };
  data.throttle = { fails: 0, lockUntil: 0 };
  await writeFile(data);
}

/** Record the counter of an accepted TOTP so the same code can't be replayed. */
export async function consumeCounter(counter: number): Promise<void> {
  if (hasDb()) {
    const pool = await db();
    await pool.query("UPDATE admin_2fa SET last_counter = ? WHERE id = 1", [counter]);
    return;
  }
  const data = await readFile();
  if (data.enrollment) data.enrollment.lastCounter = counter;
  await writeFile(data);
}

/** Consume a recovery code by its plaintext value. Returns true if it was valid and unused. */
export async function consumeRecoveryCode(code: string): Promise<boolean> {
  const hash = hashRecoveryCode(code);
  const enrollment = await getEnrollment();
  if (!enrollment) return false;
  const entry = enrollment.recovery.find((r) => r.hash === hash && !r.used);
  if (!entry) return false;
  entry.used = true;
  if (hasDb()) {
    const pool = await db();
    await pool.query("UPDATE admin_2fa SET recovery = ? WHERE id = 1", [
      JSON.stringify(enrollment.recovery),
    ]);
  } else {
    const data = await readFile();
    if (data.enrollment) data.enrollment.recovery = enrollment.recovery;
    await writeFile(data);
  }
  return true;
}

/** Remove 2FA entirely — the documented break-glass reset. */
export async function resetEnrollment(): Promise<void> {
  if (hasDb()) {
    const pool = await db();
    await pool.query("DELETE FROM admin_2fa WHERE id = 1");
    return;
  }
  await writeFile({});
}

// ---- throttling (brute-force protection on the second factor) ----

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000; // 15 minutes

async function getThrottle(): Promise<Throttle> {
  if (hasDb()) {
    const pool = await db();
    const [rows] = await pool.query("SELECT fails, lock_until FROM admin_2fa WHERE id = 1");
    const row = (rows as { fails: number; lock_until: number }[])[0];
    return row ? { fails: Number(row.fails), lockUntil: Number(row.lock_until) } : { fails: 0, lockUntil: 0 };
  }
  return (await readFile()).throttle ?? { fails: 0, lockUntil: 0 };
}

async function setThrottle(t: Throttle): Promise<void> {
  if (hasDb()) {
    const pool = await db();
    await pool.query("UPDATE admin_2fa SET fails = ?, lock_until = ? WHERE id = 1", [
      t.fails,
      t.lockUntil,
    ]);
    return;
  }
  const data = await readFile();
  data.throttle = t;
  await writeFile(data);
}

/** Seconds remaining on a lockout, or 0 if the admin may try a code now. */
export async function lockoutRemaining(): Promise<number> {
  const { lockUntil } = await getThrottle();
  const rem = lockUntil - Date.now();
  return rem > 0 ? Math.ceil(rem / 1000) : 0;
}

export async function recordFailure(): Promise<void> {
  const t = await getThrottle();
  const fails = t.fails + 1;
  await setThrottle({
    fails,
    lockUntil: fails >= MAX_FAILS ? Date.now() + LOCK_MS : 0,
  });
}

export async function clearFailures(): Promise<void> {
  await setThrottle({ fails: 0, lockUntil: 0 });
}
