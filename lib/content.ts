import "server-only";
import { unstable_cache } from "next/cache";
import { getOverrides } from "./content-store";
import { normalizeSectionVisibility, type SectionVisibility } from "./section-visibility";
import {
  guarantee,
  interviews,
  liveClasses,
  payment,
  pricing,
  socials,
  supportTeam,
  videos,
  WHATSAPP_COMMUNITY,
  WHATSAPP_NUMBER,
} from "./site";

// Admin-editable content. Defaults come from lib/site.ts; overrides from the
// admin dashboard (MySQL / .data JSON). Read via getContent() in server
// components only — client components receive what they need as props.

export type TeamMember = { name: string; phone: string; role?: string };
export type Wallet = { label: string; accountName: string; number: string };
export type Gallery = { heading: string; subheading: string; images: string[] };
export type GalleryKey = "payouts" | "earnings" | "training";
export type LiveVideo = { id: string; batch: string };
export type LiveClasses = { heading: string; subheading: string; videos: LiveVideo[] };
export type Interview = { id: string; title: string };
export type Payment = {
  bank: { provider: string; accountName: string; iban: string; accountNumber: string; qr: string };
  wallets: Wallet[];
  binance: { accountName: string; id: string; qr: string };
  note: string;
};

export type SiteContent = {
  sectionVisibility: SectionVisibility;
  whatsapp: { number: string; community: string };
  hero: { badge: string; heading: string; highlight: string; subheading: string };
  ticker: string[];
  pricing: { original: number; current: number; currency: string; seatsLeft: number };
  supportTeam: TeamMember[];
  payment: Payment;
  guarantee: string;
  videos: {
    hero: { youtubeId: string; title: string };
    story: { youtubeId: string; title: string };
  };
  socials: { label: string; href: string; icon: string }[];
  galleries: Record<GalleryKey, Gallery>;
  liveClasses: LiveClasses;
  interviews: Interview[];
};

export const CONTENT_TAG = "site-content";

const heroDefaults = {
  badge: "New batch enrolling now",
  heading: "Launch your Instagram eCommerce business in 30 days",
  highlight: "30 days",
  subheading:
    "Live classes, products already picked for you, delivery handled by our team. You learn to sell on Instagram without spending a rupee on ads.",
};

// original static images shipped in /public; admin edits replace the list wholesale
const staticImages = (folder: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/${folder}/t${String(i + 1).padStart(2, "0")}.webp`);

const galleryDefaults: Record<GalleryKey, Gallery> = {
  payouts: {
    heading: "Payouts we send to students",
    subheading: "Real payments Shoaib has sent to students for the sales they made.",
    images: staticImages("student-payouts", 11),
  },
  earnings: {
    heading: "Real student earnings",
    subheading: "Payment and commission screenshots students sent us after they started selling.",
    images: staticImages("student-earnings", 45),
  },
  training: {
    heading: "Students who did it",
    subheading: "Messages from students who started exactly where you are right now.",
    images: staticImages("training-testimonials", 20),
  },
};

function mergeGalleries(override: unknown): Record<GalleryKey, Gallery> {
  const o = isObject(override) ? override : {};
  const one = (key: GalleryKey): Gallery => {
    const g = isObject(o[key]) ? (o[key] as Record<string, unknown>) : {};
    const d = galleryDefaults[key];
    return {
      heading: typeof g.heading === "string" && g.heading.trim() ? g.heading : d.heading,
      subheading: typeof g.subheading === "string" ? g.subheading : d.subheading,
      images: Array.isArray(g.images) && g.images.length > 0 ? (g.images as string[]) : d.images,
    };
  };
  return { payouts: one("payouts"), earnings: one("earnings"), training: one("training") };
}

// tolerate the old string[] shape as well as the new {id, batch}[] shape
function normalizeLiveVideos(v: unknown): LiveVideo[] {
  if (!Array.isArray(v)) return liveClasses.videos;
  const out: LiveVideo[] = [];
  for (const item of v) {
    if (typeof item === "string") {
      out.push({ id: item, batch: "" });
    } else if (isObject(item) && typeof item.id === "string") {
      out.push({ id: item.id, batch: typeof item.batch === "string" ? item.batch : "" });
    }
  }
  return out;
}

// videos replace wholesale, empty allowed so the admin can hide the section
function mergeLiveClasses(override: unknown): LiveClasses {
  const o = isObject(override) ? override : {};
  return {
    heading: typeof o.heading === "string" && o.heading.trim() ? o.heading : liveClasses.heading,
    subheading: typeof o.subheading === "string" ? o.subheading : liveClasses.subheading,
    videos: o.videos === undefined ? liveClasses.videos : normalizeLiveVideos(o.videos),
  };
}

// interviews replace wholesale, empty allowed so the admin can hide the sections
function mergeInterviews(override: unknown): Interview[] {
  if (!Array.isArray(override)) return interviews;
  const out: Interview[] = [];
  for (const item of override) {
    if (isObject(item) && typeof item.id === "string") {
      out.push({ id: item.id, title: typeof item.title === "string" ? item.title : "" });
    }
  }
  return out;
}

function defaultTicker(p: SiteContent["pricing"]): string[] {
  return [
    `Only ${p.seatsLeft} seats left in this batch`,
    `Price rises to ${p.currency} ${p.original.toLocaleString()} after this batch closes`,
    "New live batch starting soon. Enroll today",
    "50,000+ students trained · $26M+ in organic student sales",
  ];
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Shallow-per-section merge; objects merge key-by-key, arrays/scalars replace. */
function mergeSection<T>(defaults: T, override: unknown): T {
  if (override === undefined || override === null) return defaults;
  if (isObject(defaults) && isObject(override)) {
    const out = { ...(defaults as Record<string, unknown>) };
    for (const [k, v] of Object.entries(override)) {
      out[k] = mergeSection(out[k], v);
    }
    return out as T;
  }
  return override as T;
}

// bank details merge key-by-key (qr stays from defaults); wallets replace wholesale
function mergePayment(override: unknown): Payment {
  const o = isObject(override) ? override : {};
  return {
    bank: mergeSection(payment.bank, o.bank),
    wallets:
      Array.isArray(o.wallets) && o.wallets.length > 0 ? (o.wallets as Wallet[]) : payment.wallets,
    binance: mergeSection(payment.binance, o.binance),
    note: typeof o.note === "string" && o.note.trim() ? o.note : payment.note,
  };
}

async function buildContent(): Promise<SiteContent> {
  const o = await getOverrides();

  const mergedPricing = mergeSection(
    { original: pricing.original, current: pricing.current, currency: pricing.currency, seatsLeft: pricing.seatsLeft },
    o.pricing
  );

  return {
    sectionVisibility: normalizeSectionVisibility(o.sectionVisibility),
    whatsapp: mergeSection({ number: WHATSAPP_NUMBER, community: WHATSAPP_COMMUNITY }, o.whatsapp),
    hero: mergeSection(heroDefaults, o.hero),
    // ticker defaults follow edited pricing unless the admin overrode the ticker itself
    ticker: Array.isArray(o.ticker) && o.ticker.length > 0 ? (o.ticker as string[]) : defaultTicker(mergedPricing),
    pricing: mergedPricing,
    supportTeam: Array.isArray(o.supportTeam) && o.supportTeam.length > 0 ? (o.supportTeam as TeamMember[]) : supportTeam,
    payment: mergePayment(o.payment),
    guarantee: typeof o.guarantee === "string" && o.guarantee.trim() ? o.guarantee : guarantee,
    videos: mergeSection(videos, o.videos),
    socials: Array.isArray(o.socials) && o.socials.length > 0 ? (o.socials as SiteContent["socials"]) : socials,
    galleries: mergeGalleries(o.galleries),
    liveClasses: mergeLiveClasses(o.liveClasses),
    interviews: mergeInterviews(o.interviews),
  };
}

export const getContent = unstable_cache(buildContent, [CONTENT_TAG], {
  tags: [CONTENT_TAG],
});
