import "server-only";
import { promises as fs } from "fs";
import path from "path";

// Storage for admin-edited content overrides.
// Production (Hostinger): MySQL via DB_HOST/DB_USER/DB_PASSWORD/DB_NAME env vars.
// Local dev without a DB: JSON file in .data/ (gitignored).

const TABLE = "site_content";

export const hasDb = () =>
  Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);

// ---- MySQL backend ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pool: any = null;
let tableReady = false;

export async function getPool() {
  if (!pool) {
    const mysql = await import("mysql2/promise");
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 4,
      charset: "utf8mb4",
    });
  }
  if (!tableReady) {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ${TABLE} (
        k VARCHAR(64) NOT NULL PRIMARY KEY,
        v MEDIUMTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4`
    );
    tableReady = true;
  }
  return pool;
}

// ---- JSON file backend (local dev fallback) ----

const FILE = path.join(process.cwd(), ".data", "content.json");

async function readFileStore(): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeFileStore(data: Record<string, unknown>) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf8");
}

// ---- Public API ----

/** All stored overrides, keyed by section. Returns {} on any failure so the site falls back to defaults. */
export async function getOverrides(): Promise<Record<string, unknown>> {
  try {
    if (hasDb()) {
      const db = await getPool();
      const [rows] = await db.query(`SELECT k, v FROM ${TABLE}`);
      const out: Record<string, unknown> = {};
      for (const row of rows as { k: string; v: string }[]) {
        try {
          out[row.k] = JSON.parse(row.v);
        } catch {
          // skip corrupt row
        }
      }
      return out;
    }
    return await readFileStore();
  } catch (err) {
    console.error("content-store: falling back to defaults:", err);
    return {};
  }
}

/** Upsert one section override. Throws on failure so the admin UI can surface the error. */
export async function saveSection(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  if (hasDb()) {
    const db = await getPool();
    await db.query(
      `INSERT INTO ${TABLE} (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)`,
      [key, json]
    );
    return;
  }
  const data = await readFileStore();
  data[key] = value;
  await writeFileStore(data);
}

/** Which backend is live — shown in the admin UI so misconfiguration is obvious. */
export function storageBackend(): "mysql" | "file" {
  return hasDb() ? "mysql" : "file";
}

/** Real connectivity check for the admin badge. Returns the MySQL error message on failure. */
export async function dbStatus(): Promise<{ ok: boolean; error?: string }> {
  if (!hasDb()) return { ok: false, error: "not configured" };
  try {
    const db = await getPool();
    await db.query("SELECT 1");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
