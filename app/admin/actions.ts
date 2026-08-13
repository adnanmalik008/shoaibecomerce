"use server";

import { revalidatePath, updateTag } from "next/cache";
import {
  checkPassword,
  clearPending,
  createPending,
  createSession,
  destroySession,
  isAuthed,
  readPending,
} from "@/lib/admin/auth";
import {
  clearFailures,
  consumeCounter,
  consumeRecoveryCode,
  getEnrollment,
  isEnrolled,
  lockoutRemaining,
  recordFailure,
  saveEnrollment,
} from "@/lib/admin/totp-store";
import { generateRecoveryCodes, generateSecret, verifyToken } from "@/lib/admin/totp";
import { saveSection } from "@/lib/content-store";
import { deleteImageByUrl } from "@/lib/gallery-store";
import { CONTENT_TAG, getContent, type GalleryKey, type TeamMember } from "@/lib/content";
import { SECTION_VISIBILITY_KEYS } from "@/lib/section-visibility";

// `next`: where the client should navigate after this action. Auth actions
// return it instead of calling redirect() — on this host, Next's server-side
// handling of an action redirect() tries to fetch the target through the
// public origin from inside the container, which fails ("failed to get
// redirect response: fetch failed") and surfaces as a server error page.
// The client forms navigate with window.location instead.
export type FormState = { ok: boolean; message: string; next?: string };
export type EnrollState = FormState & { recoveryCodes?: string[] };

// ---- auth: step 1, password ----

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") || "");
  if (!checkPassword(password)) {
    return { ok: false, message: "Wrong password." };
  }
  if (await isEnrolled()) {
    await createPending({ stage: "verify" });
    return { ok: true, message: "", next: "/admin/2fa" };
  }
  // no authenticator set up yet — start one-time enrollment
  await createPending({ stage: "setup", secret: generateSecret() });
  return { ok: true, message: "", next: "/admin/2fa/setup" };
}

// ---- auth: step 2, authenticator code ----

async function lockoutMessage(): Promise<string | null> {
  const lock = await lockoutRemaining();
  if (lock <= 0) return null;
  const mins = Math.ceil(lock / 60);
  return `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`;
}

export async function verifyTotpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const pending = await readPending();
  if (!pending || pending.stage !== "verify") {
    return { ok: false, message: "Your login step expired. Enter your password again." };
  }
  const locked = await lockoutMessage();
  if (locked) return { ok: false, message: locked };

  let enrollment;
  try {
    enrollment = await getEnrollment();
  } catch (err) {
    console.error("2FA verify: reading enrollment failed:", err);
    return { ok: false, message: "Could not reach the database. Try again in a moment." };
  }
  if (!enrollment) return { ok: false, message: "", next: "/admin/login" };

  const counter = verifyToken(enrollment.secret, String(formData.get("code") || ""));
  // reject invalid codes and replays of an already-used time step
  if (counter === null || counter <= enrollment.lastCounter) {
    await recordFailure();
    return { ok: false, message: "That code is not valid. Check your authenticator app and try again." };
  }
  await consumeCounter(counter);
  await clearFailures();
  await clearPending();
  await createSession();
  return { ok: true, message: "", next: "/admin" };
}

export async function verifyRecoveryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const pending = await readPending();
  if (!pending || pending.stage !== "verify") {
    return { ok: false, message: "Your login step expired. Enter your password again." };
  }
  const locked = await lockoutMessage();
  if (locked) return { ok: false, message: locked };

  let valid: boolean;
  try {
    valid = await consumeRecoveryCode(String(formData.get("code") || ""));
  } catch (err) {
    console.error("2FA recovery: database failed:", err);
    return { ok: false, message: "Could not reach the database. Try again in a moment." };
  }
  if (valid) {
    await clearFailures();
    await clearPending();
    await createSession();
    return { ok: true, message: "", next: "/admin" };
  }
  await recordFailure();
  return { ok: false, message: "That recovery code is not valid or has already been used." };
}

// ---- auth: one-time authenticator enrollment ----

export async function enrollTotpAction(_prev: EnrollState, formData: FormData): Promise<EnrollState> {
  const pending = await readPending();
  if (!pending || pending.stage !== "setup" || !pending.secret) {
    return { ok: false, message: "Setup expired. Enter your password again to restart." };
  }
  if (verifyToken(pending.secret, String(formData.get("code") || "")) === null) {
    return {
      ok: false,
      message: "That code did not match. Scan the QR in your authenticator app, then enter the current 6-digit code.",
    };
  }
  const recoveryCodes = generateRecoveryCodes(8);
  try {
    await saveEnrollment(pending.secret, recoveryCodes);
  } catch (err) {
    // saveEnrollment throws on DB failure; without this catch the visitor gets
    // a bare server-error page instead of a retryable message.
    console.error("2FA enrollment save failed:", err);
    return { ok: false, message: "Could not save the setup. Database connection failed — fix it and try again." };
  }
  return { ok: true, message: "", recoveryCodes };
}

export async function finishSetupAction(_prev: FormState): Promise<FormState> {
  const pending = await readPending();
  if (!pending || !(await isEnrolled())) return { ok: false, message: "", next: "/admin/login" };
  await clearPending();
  await createSession();
  return { ok: true, message: "", next: "/admin" };
}

export async function logoutAction(): Promise<FormState> {
  await destroySession();
  return { ok: true, message: "", next: "/admin/login" };
}

// ---- content sections ----

async function save(key: string, value: unknown): Promise<FormState> {
  if (!(await isAuthed())) return { ok: false, message: "Session expired. Log in again." };
  try {
    await saveSection(key, value);
  } catch (err) {
    console.error(`admin save ${key} failed:`, err);
    return { ok: false, message: "Save failed. Check the database connection." };
  }
  updateTag(CONTENT_TAG); // expire immediately so the admin sees their change right away
  revalidatePath("/", "layout"); // every public page renders ticker/pricing/fab from content
  return { ok: true, message: "Saved. Live on the site." };
}

const digits = (v: FormDataEntryValue | null) => String(v || "").replace(/\D/g, "");

export async function saveSectionVisibility(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const visibility = Object.fromEntries(
    SECTION_VISIBILITY_KEYS.map((key) => [key, formData.get(key) === "on"])
  );
  return save("sectionVisibility", visibility);
}

export async function saveMetaPixel(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("pixelId") || "").trim();
  // Digits-only, hard requirement: the ID is interpolated into an inline
  // script on every public page, so nothing but a numeric ID may be stored.
  if (id && !/^\d{5,20}$/.test(id)) {
    return { ok: false, message: "A Pixel ID is numbers only (usually 15-16 digits)." };
  }
  return save("metaPixelId", id);
}

export async function saveWhatsapp(_prev: FormState, formData: FormData): Promise<FormState> {
  const number = digits(formData.get("number"));
  const community = String(formData.get("community") || "").trim();
  if (number.length < 10) return { ok: false, message: "WhatsApp number looks too short. Use international format, e.g. 923395456000." };
  if (!community.startsWith("https://chat.whatsapp.com/")) {
    return { ok: false, message: "Community link must start with https://chat.whatsapp.com/" };
  }
  return save("whatsapp", { number, community });
}

export async function saveHero(_prev: FormState, formData: FormData): Promise<FormState> {
  const badge = String(formData.get("badge") || "").trim();
  const heading = String(formData.get("heading") || "").trim();
  const highlight = String(formData.get("highlight") || "").trim();
  const subheading = String(formData.get("subheading") || "").trim();
  if (!heading) return { ok: false, message: "Heading cannot be empty." };
  if (highlight && !heading.includes(highlight)) {
    return { ok: false, message: "Highlight text must appear inside the heading, exactly as typed." };
  }
  return save("hero", { badge, heading, highlight, subheading });
}

export async function saveTicker(_prev: FormState, formData: FormData): Promise<FormState> {
  const lines = String(formData.get("messages") || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { ok: false, message: "Add at least one message." };
  return save("ticker", lines);
}

export async function savePricing(_prev: FormState, formData: FormData): Promise<FormState> {
  const original = Number(digits(formData.get("original")));
  const current = Number(digits(formData.get("current")));
  const seatsLeft = Number(digits(formData.get("seatsLeft")));
  if (!current || !original) return { ok: false, message: "Prices must be numbers." };
  if (current > original) return { ok: false, message: "Current price should not be higher than the original price." };
  if (!seatsLeft || seatsLeft < 1) return { ok: false, message: "Seats left must be at least 1." };
  return save("pricing", { original, current, currency: "Rs.", seatsLeft });
}

export async function saveTeam(_prev: FormState, formData: FormData): Promise<FormState> {
  let members: TeamMember[];
  try {
    members = JSON.parse(String(formData.get("members") || "[]"));
  } catch {
    return { ok: false, message: "Could not read the team list." };
  }
  const cleaned: TeamMember[] = [];
  for (const m of members) {
    const name = String(m.name || "").trim();
    const phone = String(m.phone || "").replace(/\D/g, "");
    if (!name || !phone) return { ok: false, message: "Every member needs a name and a phone number." };
    if (!/^03\d{9}$/.test(phone)) {
      return { ok: false, message: `${name}'s number must be 11 digits starting with 03, e.g. 03260351944.` };
    }
    cleaned.push(m.role === "Manager" ? { name, phone, role: "Manager" } : { name, phone });
  }
  if (cleaned.length === 0) return { ok: false, message: "Add at least one member." };
  return save("supportTeam", cleaned);
}

export async function savePayment(_prev: FormState, formData: FormData): Promise<FormState> {
  const provider = String(formData.get("provider") || "").trim();
  const accountName = String(formData.get("accountName") || "").trim();
  const iban = String(formData.get("iban") || "").replace(/\s/g, "").toUpperCase();
  const accountNumber = String(formData.get("accountNumber") || "").replace(/\s/g, "");
  const note = String(formData.get("note") || "").trim();
  if (!provider || !accountName || !iban) {
    return { ok: false, message: "Bank name, account title, and IBAN are all required." };
  }

  let wallets: { label: string; accountName?: string; number: string }[];
  try {
    wallets = JSON.parse(String(formData.get("wallets") || "[]"));
  } catch {
    return { ok: false, message: "Could not read the wallet list." };
  }
  const cleanWallets = [];
  for (const w of wallets) {
    const label = String(w.label || "").trim();
    const number = String(w.number || "").replace(/\s/g, "");
    if (!label || !number) {
      return { ok: false, message: "Every wallet needs a label and an account number." };
    }
    cleanWallets.push({ label, accountName: String(w.accountName || "").trim() || accountName, number });
  }

  // qr stays a fixed public asset (managed in code), so it is not sent here
  return save("payment", {
    bank: { provider, accountName, iban, accountNumber },
    wallets: cleanWallets,
    note,
  });
}

const GALLERY_KEYS: GalleryKey[] = ["payouts", "earnings", "training"];

export async function saveGallery(_prev: FormState, formData: FormData): Promise<FormState> {
  const key = String(formData.get("gallery") || "") as GalleryKey;
  if (!GALLERY_KEYS.includes(key)) return { ok: false, message: "Unknown gallery." };

  const heading = String(formData.get("heading") || "").trim();
  const subheading = String(formData.get("subheading") || "").trim();
  if (!heading) return { ok: false, message: "Heading cannot be empty." };

  let images: string[];
  try {
    images = JSON.parse(String(formData.get("images") || "[]"));
  } catch {
    return { ok: false, message: "Could not read the image list." };
  }
  images = images.filter((u) => typeof u === "string" && u.startsWith("/") && !u.includes(".."));
  if (images.length === 0) {
    return { ok: false, message: "Keep at least one screenshot in the carousel." };
  }

  if (!(await isAuthed())) return { ok: false, message: "Session expired. Log in again." };

  // free storage for uploaded images that were removed from the list
  const before = (await getContent()).galleries[key].images;
  const kept = new Set(images);
  for (const url of before) {
    if (!kept.has(url)) {
      try {
        await deleteImageByUrl(url);
      } catch (err) {
        console.error("gallery image cleanup failed:", err);
      }
    }
  }

  const current = (await getContent()).galleries;
  return save("galleries", {
    ...Object.fromEntries(GALLERY_KEYS.map((k) => [k, current[k]])),
    [key]: { heading, subheading, images },
  });
}

export async function saveGuarantee(_prev: FormState, formData: FormData): Promise<FormState> {
  const text = String(formData.get("guarantee") || "").trim();
  if (!text) return { ok: false, message: "Guarantee text cannot be empty." };
  return save("guarantee", text);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Accepts a full YouTube URL or a bare 11-char video ID. */
function youtubeId(input: string): string | null {
  const v = input.trim();
  if (/^[\w-]{11}$/.test(v)) return v;
  const m = v.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export async function saveVideos(_prev: FormState, formData: FormData): Promise<FormState> {
  const heroId = youtubeId(String(formData.get("heroVideo") || ""));
  const storyId = youtubeId(String(formData.get("storyVideo") || ""));
  if (!heroId || !storyId) {
    return { ok: false, message: "Paste a valid YouTube link (or 11-character video ID) for both videos." };
  }
  return save("videos", {
    hero: {
      youtubeId: heroId,
      title: String(formData.get("heroTitle") || "").trim() || "Course introduction",
    },
    story: {
      youtubeId: storyId,
      title: String(formData.get("storyTitle") || "").trim() || "How the training works",
    },
  });
}

export async function saveLiveClasses(_prev: FormState, formData: FormData): Promise<FormState> {
  const heading = String(formData.get("heading") || "").trim();
  if (!heading) return { ok: false, message: "The heading cannot be empty." };
  const subheading = String(formData.get("subheading") || "").trim();

  let rawVideos: unknown;
  try {
    rawVideos = JSON.parse(String(formData.get("videos") || "[]"));
  } catch {
    return { ok: false, message: "Could not read the video list." };
  }
  if (!Array.isArray(rawVideos)) {
    return { ok: false, message: "Could not read the video list." };
  }
  const videos: { id: string; batch: string }[] = [];
  for (const v of rawVideos) {
    const url = isPlainObject(v) ? String(v.url || "") : String(v || "");
    const id = youtubeId(url);
    if (!id) {
      return { ok: false, message: "Every video needs a valid YouTube link (or 11-character video ID)." };
    }
    const batch = isPlainObject(v) ? String(v.batch || "").trim() : "";
    videos.push({ id, batch });
  }

  // an empty list is allowed: it hides the section on the site
  return save("liveClasses", { heading, subheading, videos });
}

export async function saveInterviews(_prev: FormState, formData: FormData): Promise<FormState> {
  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("interviews") || "[]"));
  } catch {
    return { ok: false, message: "Could not read the interview list." };
  }
  if (!Array.isArray(rawItems)) {
    return { ok: false, message: "Could not read the interview list." };
  }
  const items: { id: string; title: string }[] = [];
  for (const item of rawItems) {
    const url = isPlainObject(item) ? String(item.url || "") : "";
    const id = youtubeId(url);
    if (!id) {
      return { ok: false, message: "Every interview needs a valid YouTube link (or 11-character video ID)." };
    }
    const title = isPlainObject(item) ? String(item.title || "").trim() : "";
    if (!title) {
      return { ok: false, message: "Every interview needs a title. It becomes the section heading." };
    }
    items.push({ id, title });
  }

  // an empty list is allowed: it hides the interview sections on the site
  return save("interviews", items);
}

export async function saveSocials(_prev: FormState, formData: FormData): Promise<FormState> {
  const entries = [
    { label: "Instagram", icon: "instagram", href: String(formData.get("instagram") || "").trim() },
    { label: "TikTok", icon: "tiktok", href: String(formData.get("tiktok") || "").trim() },
    { label: "YouTube", icon: "youtube", href: String(formData.get("youtube") || "").trim() },
    { label: "X", icon: "x", href: String(formData.get("x") || "").trim() },
  ].filter((s) => s.href);
  for (const s of entries) {
    if (!s.href.startsWith("https://")) {
      return { ok: false, message: `${s.label} link must start with https://` };
    }
  }
  if (entries.length === 0) return { ok: false, message: "Add at least one social link." };
  return save("socials", entries);
}
