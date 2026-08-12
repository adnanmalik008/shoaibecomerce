import "server-only";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getPool, hasDb } from "@/lib/content-store";

// Storage for admin-uploaded carousel screenshots. Production keeps the bytes
// in MySQL (deploy-proof on Hostinger); local dev without a DB falls back to
// .data/uploads/. Original images shipped in /public stay static files.

const DIR = path.join(process.cwd(), ".data", "uploads");

export const ALLOWED_TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};
export const MAX_BYTES = 3 * 1024 * 1024; // 3 MB per image

let tableReady = false;
async function db() {
  const pool = await getPool();
  if (!tableReady) {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS gallery_images (
        id VARCHAR(32) NOT NULL PRIMARY KEY,
        mime VARCHAR(32) NOT NULL,
        data MEDIUMBLOB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );
    tableReady = true;
  }
  return pool;
}

/** Store image bytes; returns the public URL to reference in a gallery list. */
export async function saveImage(mime: string, data: Buffer): Promise<string> {
  const id = randomBytes(12).toString("hex");
  if (hasDb()) {
    const pool = await db();
    await pool.query("INSERT INTO gallery_images (id, mime, data) VALUES (?, ?, ?)", [
      id,
      mime,
      data,
    ]);
  } else {
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(path.join(DIR, `${id}.${ALLOWED_TYPES[mime]}`), data);
  }
  return `/api/gallery-image/${id}`;
}

export async function getImage(id: string): Promise<{ mime: string; data: Buffer } | null> {
  if (!/^[a-f0-9]{24}$/.test(id)) return null;
  if (hasDb()) {
    const pool = await db();
    const [rows] = await pool.query("SELECT mime, data FROM gallery_images WHERE id = ?", [id]);
    const row = (rows as { mime: string; data: Buffer }[])[0];
    return row ? { mime: row.mime, data: row.data } : null;
  }
  for (const [mime, ext] of Object.entries(ALLOWED_TYPES)) {
    try {
      const data = await fs.readFile(path.join(DIR, `${id}.${ext}`));
      return { mime, data };
    } catch {
      // try next extension
    }
  }
  return null;
}

/** Delete an uploaded image by its public URL. Static /public paths are ignored. */
export async function deleteImageByUrl(url: string): Promise<void> {
  const m = url.match(/^\/api\/gallery-image\/([a-f0-9]{24})$/);
  if (!m) return;
  const id = m[1];
  if (hasDb()) {
    const pool = await db();
    await pool.query("DELETE FROM gallery_images WHERE id = ?", [id]);
    return;
  }
  for (const ext of Object.values(ALLOWED_TYPES)) {
    await fs.rm(path.join(DIR, `${id}.${ext}`), { force: true });
  }
}
