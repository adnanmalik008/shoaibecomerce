"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Gallery, GalleryKey, SiteContent, TeamMember, Wallet } from "@/lib/content";
import { Icon } from "@/components/icons";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import {
  saveGallery,
  saveGuarantee,
  saveHero,
  saveInterviews,
  saveLiveClasses,
  savePayment,
  savePricing,
  saveSocials,
  saveTeam,
  saveTicker,
  saveVideos,
  saveWhatsapp,
  type FormState,
} from "@/app/admin/actions";

const initial: FormState = { ok: false, message: "" };

// width kept separate so per-field widths (team rows) aren't overridden by w-full
const inputBase =
  "rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20";
const inputClass = `${inputBase} w-full`;

// Same palette the site uses for support-team avatars
const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-cyan-600",
];

/** Accepts a full YouTube URL or a bare 11-char video ID. Mirrors the server parser. */
function parseYoutubeId(input: string): string | null {
  const v = input.trim();
  if (/^[\w-]{11}$/.test(v)) return v;
  const m = v.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// ---- drag-to-reorder (pointer based, works for mouse and touch) ----

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// Live reorder: dragging a handle rearranges items as the pointer passes over
// siblings. Works for both vertical lists and grids by picking the item whose
// center is nearest the pointer. Mark each draggable element with the returned
// itemProps and attach handleProps to its drag handle.
function useReorder(applyMove: (from: number, to: number) => void) {
  const containerRef = useRef<HTMLElement | null>(null);
  const setContainer = (el: HTMLElement | null) => {
    containerRef.current = el;
  };
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fromRef = useRef<number | null>(null);

  const nearestIndex = (x: number, y: number): number | null => {
    const el = containerRef.current;
    if (!el) return null;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-reorder-item]"));
    let best: number | null = null;
    let bestDist = Infinity;
    nodes.forEach((n, i) => {
      const r = n.getBoundingClientRect();
      const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  };

  const handleProps = (index: number) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": "Drag to reorder",
    style: { touchAction: "none" as const, cursor: "grab" },
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      fromRef.current = index;
      setDragIndex(index);
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const from = fromRef.current;
      if (from === null) return;
      const to = nearestIndex(e.clientX, e.clientY);
      if (to !== null && to !== from) {
        applyMove(from, to);
        fromRef.current = to;
        setDragIndex(to);
      }
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      fromRef.current = null;
      setDragIndex(null);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    },
    onPointerCancel: () => {
      fromRef.current = null;
      setDragIndex(null);
    },
  });

  return { setContainer, handleProps, dragIndex };
}

function DragHandle({
  props,
  className = "",
}: {
  props: ReturnType<ReturnType<typeof useReorder>["handleProps"]>;
  className?: string;
}) {
  return (
    <span
      {...props}
      className={`flex shrink-0 touch-none items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 active:cursor-grabbing ${className}`}
    >
      <Icon name="grip" className="h-4 w-4" />
    </span>
  );
}

// ---- shared section plumbing ----

function useSection(action: (prev: FormState, formData: FormData) => Promise<FormState>) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [dirty, setDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const lastState = useRef(state);

  // Sync the save UI to each new server-action result: mark clean and flash
  // "Saved" on success (auto-hiding after 4s), or clear a stale success on a
  // later failure. The guard makes this run once per distinct result — a valid
  // effect use (reacting to a settled action), so the set-state rule is scoped off.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (state === lastState.current) return;
    lastState.current = state;
    if (!state.ok) {
      setShowSaved(false);
      return;
    }
    setDirty(false);
    setShowSaved(true);
    const t = setTimeout(() => setShowSaved(false), 4000);
    return () => clearTimeout(t);
  }, [state]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { state, formAction, pending, dirty, markDirty: () => setDirty(true), showSaved };
}

type Section = ReturnType<typeof useSection>;

function Card({
  id,
  icon,
  title,
  description,
  section,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  description: string;
  section: Section;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-36 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:scroll-mt-24"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Icon name={icon} className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        {section.dirty && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
            Unsaved changes
          </span>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SaveRow({ section }: { section: Section }) {
  const { state, pending, dirty, showSaved } = section;
  const errorShown = !state.ok && Boolean(state.message);
  return (
    <div className="mt-5 flex min-h-10 flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
      <button
        type="submit"
        disabled={pending || (!dirty && !errorShown)}
        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
      <div aria-live="polite">
        {errorShown && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {state.message}
          </p>
        )}
        {showSaved && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <Icon name="check" className="h-4 w-4" />
            Saved. Live on the site.
          </p>
        )}
      </div>
    </div>
  );
}

function Label({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {hint && <span className="ml-2 font-normal text-slate-500">{hint}</span>}
    </label>
  );
}

function PreviewShell({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <p className="border-b border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label || "How it looks on the site"}
      </p>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ---- WhatsApp ----

export function WhatsappForm({ value }: { value: SiteContent["whatsapp"] }) {
  const section = useSection(saveWhatsapp);
  const [number, setNumber] = useState(value.number);
  const [community, setCommunity] = useState(value.community);
  const cleanNumber = number.replace(/\D/g, "");

  return (
    <Card
      id="whatsapp"
      icon="whatsapp"
      title="WhatsApp"
      description="The number every button and the enquiry form open, and the free community invite link."
      section={section}
    >
      <form action={section.formAction} onChange={section.markDirty} className="space-y-4">
        <div>
          <Label htmlFor="wa-number" hint="country code first, no + sign">Main WhatsApp number</Label>
          <input
            id="wa-number"
            name="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="923395456000"
            inputMode="numeric"
            className={inputClass}
          />
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="font-mono text-slate-500">wa.me/{cleanNumber || "..."}</span>
            {cleanNumber.length >= 10 && (
              <a
                href={`https://wa.me/${cleanNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 py-1 font-semibold text-emerald-700 hover:underline"
              >
                Send a test message
                <Icon name="external" className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="wa-community">Community invite link</Label>
          <input
            id="wa-community"
            name="community"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            placeholder="https://chat.whatsapp.com/..."
            className={inputClass}
          />
          {community.startsWith("https://chat.whatsapp.com/") && (
            <a
              href={community}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 py-1 text-xs font-semibold text-emerald-700 hover:underline"
            >
              Open the invite
              <Icon name="external" className="h-3 w-3" />
            </a>
          )}
        </div>
        <SaveRow section={section} />
      </form>
    </Card>
  );
}

// ---- Hero ----

export function HeroForm({ value }: { value: SiteContent["hero"] }) {
  const section = useSection(saveHero);
  const [badge, setBadge] = useState(value.badge);
  const [heading, setHeading] = useState(value.heading);
  const [highlight, setHighlight] = useState(value.highlight);
  const [subheading, setSubheading] = useState(value.subheading);

  // match the server, which trims highlight before searching the heading
  const trimmedHighlight = highlight.trim();
  const hlStart = trimmedHighlight ? heading.indexOf(trimmedHighlight) : -1;
  const highlightMissing = trimmedHighlight !== "" && hlStart < 0;

  return (
    <Card
      id="hero"
      icon="type"
      title="Home page hero"
      description="The first screen visitors see: badge, headline, and the line under it."
      section={section}
    >
      <form action={section.formAction} onChange={section.markDirty} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
          <div>
            <Label htmlFor="hero-badge">Badge</Label>
            <input id="hero-badge" name="badge" value={badge} onChange={(e) => setBadge(e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label htmlFor="hero-highlight" hint="gets the green underline">Highlighted words</Label>
            <input
              id="hero-highlight"
              name="highlight"
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="hero-heading">Headline</Label>
          <input id="hero-heading" name="heading" value={heading} onChange={(e) => setHeading(e.target.value)} className={inputClass} />
          {highlightMissing && (
            <p className="mt-1.5 text-xs text-amber-700">
              The highlighted words must appear in the headline exactly as typed, or nothing gets underlined.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="hero-sub">Subheading</Label>
          <textarea
            id="hero-sub"
            name="subheading"
            rows={3}
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            className={inputClass}
          />
        </div>

        <PreviewShell>
          <div className="text-center">
            {badge.trim() && (
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {badge}
              </p>
            )}
            <p className="mx-auto mt-3 max-w-md font-display text-2xl font-bold leading-tight tracking-tight text-slate-900">
              {hlStart < 0 ? (
                heading
              ) : (
                <>
                  {heading.slice(0, hlStart)}
                  <span className="underline decoration-emerald-500 decoration-[3px] underline-offset-4">
                    {trimmedHighlight}
                  </span>
                  {heading.slice(hlStart + trimmedHighlight.length)}
                </>
              )}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">{subheading}</p>
          </div>
        </PreviewShell>

        <SaveRow section={section} />
      </form>
    </Card>
  );
}

// ---- Videos ----

function VideoField({
  idPrefix,
  legend,
  hint,
  urlName,
  titleName,
  initialId,
  initialTitle,
}: {
  idPrefix: string;
  legend: string;
  hint: string;
  urlName: string;
  titleName: string;
  initialId: string;
  initialTitle: string;
}) {
  const [url, setUrl] = useState(`https://www.youtube.com/watch?v=${initialId}`);
  const [title, setTitle] = useState(initialTitle);
  const videoId = parseYoutubeId(url);

  return (
    <fieldset className="rounded-xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-900">{legend}</legend>
      <p className="text-xs text-slate-500">{hint}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_150px]">
        <div className="space-y-3">
          <div>
            <Label htmlFor={`${idPrefix}-url`}>YouTube link</Label>
            <input
              id={`${idPrefix}-url`}
              name={urlName}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-title`} hint="shown to Google and screen readers">Video title</Label>
            <input
              id={`${idPrefix}-title`}
              name={titleName}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          {videoId ? (
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <span className="relative block overflow-hidden rounded-lg border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                  alt="Video thumbnail preview"
                  className="aspect-video w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-slate-950/30 opacity-90 transition-opacity group-hover:opacity-100">
                  <Icon name="play" className="h-8 w-8 text-white" />
                </span>
              </span>
              <span className="mt-1.5 block text-center text-[11px] font-medium text-slate-600 group-hover:text-slate-900">
                Watch on YouTube
              </span>
            </a>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-center text-xs text-slate-500">
              Paste a YouTube link to see the video here
            </div>
          )}
        </div>
      </div>
    </fieldset>
  );
}

export function VideosForm({ value }: { value: SiteContent["videos"] }) {
  const section = useSection(saveVideos);

  return (
    <Card
      id="videos"
      icon="play"
      title="Home page videos"
      description="Paste any YouTube link. The thumbnail confirms you picked the right video before saving."
      section={section}
    >
      <form action={section.formAction} onChange={section.markDirty} className="space-y-4">
        <VideoField
          idPrefix="video-hero"
          legend="Hero video"
          hint="The big video at the top of the home page, next to the HUM News card."
          urlName="heroVideo"
          titleName="heroTitle"
          initialId={value.hero.youtubeId}
          initialTitle={value.hero.title}
        />
        <VideoField
          idPrefix="video-story"
          legend="How the training works"
          hint="Plays under the 'See how the training works' heading further down the home page."
          urlName="storyVideo"
          titleName="storyTitle"
          initialId={value.story.youtubeId}
          initialTitle={value.story.title}
        />
        <SaveRow section={section} />
      </form>
    </Card>
  );
}

// ---- Ticker ----

export function TickerForm({ value }: { value: string[] }) {
  const section = useSection(saveTicker);
  const [text, setText] = useState(value.join("\n"));
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <Card
      id="ticker"
      icon="megaphone"
      title="Top ticker"
      description="The messages scrolling in the black bar at the very top of every page. One per line."
      section={section}
    >
      <form action={section.formAction} onChange={section.markDirty} className="space-y-4">
        <textarea
          name="messages"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={inputClass}
          aria-label="Ticker messages, one per line"
        />
        <PreviewShell>
          <div className="-m-4 overflow-hidden bg-slate-900 px-4 py-2">
            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
              {(lines.length ? lines : ["Add at least one message"]).map((msg, i) => (
                <span key={i} className="flex items-center gap-2 text-xs font-medium text-white">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {msg}
                </span>
              ))}
            </div>
          </div>
        </PreviewShell>
        <SaveRow section={section} />
      </form>
    </Card>
  );
}

// ---- Pricing ----

export function PricingForm({ value }: { value: SiteContent["pricing"] }) {
  const section = useSection(savePricing);
  const [current, setCurrent] = useState(String(value.current));
  const [original, setOriginal] = useState(String(value.original));
  const [seats, setSeats] = useState(String(value.seatsLeft));

  const cur = Number(current.replace(/\D/g, "")) || 0;
  const orig = Number(original.replace(/\D/g, "")) || 0;
  const seatCount = Number(seats.replace(/\D/g, "")) || 0;
  const discount = orig > 0 && cur < orig ? Math.round(((orig - cur) / orig) * 100) : 0;

  return (
    <Card
      id="pricing"
      icon="wallet"
      title="Pricing"
      description="Course fee and seats. Shown everywhere: pricing card, popup, sticky bar, and every enroll button."
      section={section}
    >
      <form action={section.formAction} onChange={section.markDirty} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price-current" hint="Rs.">Current price</Label>
            <input id="price-current" name="current" inputMode="numeric" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label htmlFor="price-original" hint="struck-through">Original price</Label>
            <input id="price-original" name="original" inputMode="numeric" value={original} onChange={(e) => setOriginal(e.target.value)} className={inputClass} />
          </div>
          <div>
            <Label htmlFor="price-seats">Seats left</Label>
            <input id="price-seats" name="seatsLeft" inputMode="numeric" value={seats} onChange={(e) => setSeats(e.target.value)} className={inputClass} />
          </div>
        </div>

        <PreviewShell>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-display text-3xl font-bold tracking-tight text-slate-900">
              Rs. {cur.toLocaleString("en-US")}
            </span>
            <span className="text-lg text-slate-400 line-through">Rs. {orig.toLocaleString("en-US")}</span>
            {discount > 0 && (
              <span className="text-sm font-medium text-emerald-700">Save {discount}%</span>
            )}
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Only {seatCount} seats left
            </span>
          </div>
        </PreviewShell>

        <SaveRow section={section} />
      </form>
    </Card>
  );
}

// ---- Support team ----

type Row = TeamMember & { uid: number };
let uidCounter = 0;

export function TeamForm({ value }: { value: TeamMember[] }) {
  const section = useSection(saveTeam);
  const { confirm, dialog } = useConfirm();
  const [rows, setRows] = useState<Row[]>(() => value.map((m) => ({ ...m, uid: uidCounter++ })));
  const [announce, setAnnounce] = useState("");
  const managerCount = rows.filter((m) => m.role === "Manager").length;
  const members: TeamMember[] = rows.map(({ name, phone, role }) =>
    role === "Manager" ? { name, phone, role } : { name, phone }
  );

  const update = (uid: number, patch: Partial<TeamMember>) => {
    setRows((r) => r.map((m) => (m.uid === uid ? { ...m, ...patch } : m)));
    section.markDirty();
  };
  const { setContainer, handleProps, dragIndex } = useReorder((from, to) => {
    const name = rows[from]?.name || "Member";
    setRows((r) => arrayMove(r, from, to));
    setAnnounce(`${name} moved to position ${to + 1} of ${rows.length}`);
    section.markDirty();
  });
  const remove = async (uid: number, name: string) => {
    const ok = await confirm({
      title: `Remove ${name || "this member"}?`,
      message: "They disappear from the enroll page support team after you save.",
    });
    if (!ok) return;
    setRows((r) => r.filter((m) => m.uid !== uid));
    setAnnounce(`${name || "Member"} removed`);
    section.markDirty();
  };

  return (
    <Card
      id="team"
      icon="headset"
      title="Support team"
      description="The people on the enroll page. Managers get the dark highlighted row at the top."
      section={section}
    >
      {dialog}
      <form action={section.formAction}>
        <input type="hidden" name="members" value={JSON.stringify(members)} />
        <p aria-live="polite" className="sr-only">{announce}</p>
        <p className="mb-3 text-xs font-medium text-slate-500">
          {rows.length} {rows.length === 1 ? "member" : "members"}
          {managerCount > 0 && <> · {managerCount} {managerCount === 1 ? "manager" : "managers"}</>}
          {rows.length > 1 && <> · drag the handle to reorder</>}
        </p>
        <ul ref={setContainer} className="space-y-2.5">
          {rows.map((m, i) => (
            <li
              key={m.uid}
              data-reorder-item
              className={`rounded-xl border border-slate-200 p-3 ${
                dragIndex === i ? "opacity-60 ring-2 ring-slate-900" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <DragHandle props={handleProps(i)} className="h-10 w-6" />
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                  aria-hidden="true"
                >
                  {(m.name || "?")[0].toUpperCase()}
                </span>
                <input
                  aria-label={`Member ${i + 1} name`}
                  value={m.name}
                  onChange={(e) => update(m.uid, { name: e.target.value })}
                  placeholder="Name"
                  className={`${inputBase} min-w-24 flex-1`}
                />
                <input
                  aria-label={`Member ${i + 1} phone`}
                  value={m.phone}
                  onChange={(e) => update(m.uid, { phone: e.target.value })}
                  placeholder="03001234567"
                  inputMode="numeric"
                  className={`${inputBase} min-w-32 flex-1 font-mono`}
                />
                <select
                  aria-label={`Member ${i + 1} role`}
                  value={m.role === "Manager" ? "Manager" : ""}
                  onChange={(e) => update(m.uid, { role: e.target.value || undefined })}
                  className={`${inputBase} w-28 flex-none`}
                >
                  <option value="">Team</option>
                  <option value="Manager">Manager</option>
                </select>
                <button
                  type="button"
                  onClick={() => remove(m.uid, m.name)}
                  aria-label={`Remove ${m.name || `member ${i + 1}`}`}
                  className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            setRows((r) => [...r, { name: "", phone: "", uid: uidCounter++ }]);
            section.markDirty();
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-500 hover:text-slate-900"
        >
          <Icon name="plus" className="h-4 w-4" />
          Add member
        </button>
        <SaveRow section={section} />
      </form>
    </Card>
  );
}

// ---- Payment ----

type WalletRow = Wallet & { uid: number };

export function PaymentForm({ value }: { value: SiteContent["payment"] }) {
  const section = useSection(savePayment);
  const { confirm, dialog } = useConfirm();
  const [provider, setProvider] = useState(value.bank.provider);
  const [accountName, setAccountName] = useState(value.bank.accountName);
  const [iban, setIban] = useState(value.bank.iban);
  const [accountNumber, setAccountNumber] = useState(value.bank.accountNumber);
  const [note, setNote] = useState(value.note);
  const [wallets, setWallets] = useState<WalletRow[]>(() => value.wallets.map((w) => ({ ...w, uid: uidCounter++ })));

  const walletsForSave: Wallet[] = wallets.map(({ label, accountName: an, number }) => ({ label, accountName: an, number }));
  const updateWallet = (uid: number, patch: Partial<Wallet>) => {
    setWallets((r) => r.map((w) => (w.uid === uid ? { ...w, ...patch } : w)));
    section.markDirty();
  };
  const { setContainer, handleProps, dragIndex } = useReorder((from, to) => {
    setWallets((r) => arrayMove(r, from, to));
    section.markDirty();
  });
  const removeWallet = async (uid: number, label: string) => {
    const ok = await confirm({
      title: `Remove ${label || "this payment option"}?`,
      message: "It disappears from the payment details after you save.",
    });
    if (!ok) return;
    setWallets((r) => r.filter((w) => w.uid !== uid));
    section.markDirty();
  };

  return (
    <Card
      id="payment"
      icon="bank"
      title="Payment methods"
      description="Where students send the fee. Shown on the home page and the enroll page with copy buttons."
      section={section}
    >
      {dialog}
      <form action={section.formAction} onChange={section.markDirty} className="space-y-5">
        <input type="hidden" name="wallets" value={JSON.stringify(walletsForSave)} />

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-900">Bank transfer</p>
          <p className="mt-0.5 text-xs text-slate-500">
            The payment QR image is managed in the code — ask your developer to swap it if the bank changes.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pay-provider">Bank</Label>
              <input id="pay-provider" name="provider" value={provider} onChange={(e) => setProvider(e.target.value)} className={inputClass} />
            </div>
            <div>
              <Label htmlFor="pay-account-name">Account title</Label>
              <input id="pay-account-name" name="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <Label htmlFor="pay-iban">IBAN</Label>
              <input id="pay-iban" name="iban" value={iban} onChange={(e) => setIban(e.target.value)} className={`${inputClass} font-mono tracking-wide`} />
            </div>
            <div>
              <Label htmlFor="pay-account-number">Account number</Label>
              <input id="pay-account-number" name="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} inputMode="numeric" className={`${inputClass} font-mono tracking-wide`} />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Mobile wallets</p>
          <ul ref={setContainer} className="space-y-2.5">
            {wallets.map((w, i) => (
              <li
                key={w.uid}
                data-reorder-item
                className={`rounded-xl border border-slate-200 p-3 ${
                  dragIndex === i ? "opacity-60 ring-2 ring-slate-900" : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  {wallets.length > 1 && <DragHandle props={handleProps(i)} className="h-10 w-6" />}
                  <input
                    aria-label="Wallet label"
                    value={w.label}
                    onChange={(e) => updateWallet(w.uid, { label: e.target.value })}
                    placeholder="Easypaisa / JazzCash"
                    className={`${inputBase} min-w-40 flex-1`}
                  />
                  <input
                    aria-label="Wallet account number"
                    value={w.number}
                    onChange={(e) => updateWallet(w.uid, { number: e.target.value })}
                    placeholder="03001234567"
                    inputMode="numeric"
                    className={`${inputBase} min-w-32 flex-1 font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => removeWallet(w.uid, w.label)}
                    aria-label={`Remove ${w.label || "wallet"}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setWallets((r) => [...r, { label: "", accountName, number: "", uid: uidCounter++ }]);
              section.markDirty();
            }}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-500 hover:text-slate-900"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add wallet
          </button>
        </div>

        <div>
          <Label htmlFor="pay-note">Note under the details</Label>
          <input id="pay-note" name="note" value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
        </div>
        <SaveRow section={section} />
      </form>
    </Card>
  );
}

// ---- Guarantee ----

export function GuaranteeForm({ value }: { value: string }) {
  const section = useSection(saveGuarantee);
  const [text, setText] = useState(value);
  return (
    <Card
      id="guarantee"
      icon="shield"
      title="Guarantee line"
      description="The reassurance under the pricing card, on the enroll page, and in the home CTA."
      section={section}
    >
      <form action={section.formAction} onChange={section.markDirty} className="space-y-4">
        <textarea
          name="guarantee"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={inputClass}
          aria-label="Guarantee text"
        />
        <PreviewShell>
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
            <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm leading-relaxed text-emerald-800">{text || "Write the guarantee above"}</p>
          </div>
        </PreviewShell>
        <SaveRow section={section} />
      </form>
    </Card>
  );
}

// ---- Screenshot galleries ----

export function GalleryForm({
  galleryKey,
  title,
  description,
  value,
}: {
  galleryKey: GalleryKey;
  title: string;
  description: string;
  value: Gallery;
}) {
  const section = useSection(saveGallery);
  const { confirm, dialog } = useConfirm();
  const [heading, setHeading] = useState(value.heading);
  const [subheading, setSubheading] = useState(value.subheading);
  const [images, setImages] = useState<string[]>(value.images);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { setContainer, handleProps, dragIndex } = useReorder((from, to) => {
    setImages((imgs) => arrayMove(imgs, from, to));
    section.markDirty();
  });

  const onFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setUploading(true);
    setUploadError("");
    const form = new FormData();
    for (const f of Array.from(list)) form.append("files", f);
    try {
      const res = await fetch("/api/admin/gallery-upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error || "Upload failed.");
      } else {
        setImages((prev) => [...prev, ...json.urls]);
        section.markDirty();
      }
    } catch {
      setUploadError("Upload failed. Check your connection and try again.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = async (url: string) => {
    const ok = await confirm({
      title: "Remove this screenshot?",
      message: "It leaves the carousel after you save changes.",
    });
    if (!ok) return;
    setImages((prev) => prev.filter((u) => u !== url));
    section.markDirty();
  };

  return (
    <Card id={`gallery-${galleryKey}`} icon="image" title={title} description={description} section={section}>
      {dialog}
      <form action={section.formAction} className="space-y-4">
        <input type="hidden" name="gallery" value={galleryKey} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`g-${galleryKey}-heading`}>Heading</Label>
            <input
              id={`g-${galleryKey}-heading`}
              name="heading"
              value={heading}
              onChange={(e) => {
                setHeading(e.target.value);
                section.markDirty();
              }}
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor={`g-${galleryKey}-sub`} hint="leave empty to hide">Subheading</Label>
            <input
              id={`g-${galleryKey}-sub`}
              name="subheading"
              value={subheading}
              onChange={(e) => {
                setSubheading(e.target.value);
                section.markDirty();
              }}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-500">
            {images.length} {images.length === 1 ? "screenshot" : "screenshots"} in this carousel
            {images.length > 1 && <> · drag the handle to reorder</>}
          </p>
          <ul ref={setContainer} className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
            {images.map((url, i) => (
              <li
                key={url}
                data-reorder-item
                className={`group relative ${dragIndex === i ? "opacity-60 ring-2 ring-slate-900" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="aspect-[3/4] w-full rounded-lg border border-slate-200 object-cover"
                />
                {images.length > 1 && (
                  <DragHandle
                    props={handleProps(i)}
                    className="absolute left-1 top-1 h-8 w-8 bg-white/95 shadow-sm"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  aria-label="Remove screenshot"
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-500 shadow-sm hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-900 disabled:opacity-50"
              >
                <Icon name="plus" className="h-5 w-5" />
                <span className="text-xs font-semibold">{uploading ? "Uploading..." : "Add"}</span>
              </button>
            </li>
          </ul>
          <input
            ref={fileRef}
            type="file"
            accept="image/webp,image/jpeg,image/png"
            multiple
            onChange={(e) => onFiles(e.target.files)}
            className="sr-only"
            aria-label="Upload screenshots"
          />
          {uploadError && (
            <p role="alert" className="mt-2 text-sm font-medium text-red-600">
              {uploadError}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            WEBP, JPG, or PNG, up to 3 MB each. You can select several at once. Removing a
            screenshot only takes effect after you save.
          </p>
        </div>

        <SaveRow section={section} />
      </form>
    </Card>
  );
}

// ---- Socials ----

const SOCIAL_FIELDS = [
  { label: "Instagram", name: "instagram", icon: "instagram" },
  { label: "TikTok", name: "tiktok", icon: "tiktok" },
  { label: "YouTube", name: "youtube", icon: "youtube" },
  { label: "X", name: "x", icon: "x" },
] as const;

// ---- Live class videos ----

type VideoRow = { url: string; batch: string; uid: number };

export function LiveClassesForm({ value }: { value: SiteContent["liveClasses"] }) {
  const section = useSection(saveLiveClasses);
  const { confirm, dialog } = useConfirm();
  const [heading, setHeading] = useState(value.heading);
  const [subheading, setSubheading] = useState(value.subheading);
  const [rows, setRows] = useState<VideoRow[]>(() =>
    value.videos.map((v) => ({
      url: `https://www.youtube.com/watch?v=${v.id}`,
      batch: v.batch,
      uid: uidCounter++,
    }))
  );

  const update = (uid: number, patch: Partial<VideoRow>) => {
    setRows((r) => r.map((v) => (v.uid === uid ? { ...v, ...patch } : v)));
    section.markDirty();
  };
  const { setContainer, handleProps, dragIndex } = useReorder((from, to) => {
    setRows((r) => arrayMove(r, from, to));
    section.markDirty();
  });
  const remove = async (uid: number, index: number) => {
    const ok = await confirm({
      title: `Remove video ${index + 1}?`,
      message: "It leaves the carousel after you save changes.",
    });
    if (!ok) return;
    setRows((r) => r.filter((v) => v.uid !== uid));
    section.markDirty();
  };

  return (
    <Card
      id="live-classes"
      icon="play"
      title="Live class videos"
      description="Reel-style clips from live classes, shown as the fourth carousel on the home page. Paste YouTube Shorts links (regular YouTube links work too). The section stays hidden while this list is empty."
      section={section}
    >
      {dialog}
      <form action={section.formAction} className="space-y-4">
        <input
          type="hidden"
          name="videos"
          value={JSON.stringify(rows.map((v) => ({ url: v.url, batch: v.batch })))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="lc-heading">Heading</Label>
            <input
              id="lc-heading"
              name="heading"
              value={heading}
              onChange={(e) => {
                setHeading(e.target.value);
                section.markDirty();
              }}
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor="lc-subheading" hint="optional">Subheading</Label>
            <input
              id="lc-subheading"
              name="subheading"
              value={subheading}
              onChange={(e) => {
                setSubheading(e.target.value);
                section.markDirty();
              }}
              className={inputClass}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
            No videos yet. Click &ldquo;Add video&rdquo; below, paste a YouTube Shorts link, and
            save. Each one plays vertical, just like a Short.
          </p>
        ) : (
          <p className="text-xs font-medium text-slate-500">
            {rows.length} {rows.length === 1 ? "video" : "videos"}
            {rows.length > 1 && <> · drag the handle to reorder</>}
          </p>
        )}
        <ul ref={setContainer} className="space-y-2.5">
          {rows.map((v, i) => {
            const id = parseYoutubeId(v.url);
            return (
              <li
                key={v.uid}
                data-reorder-item
                className={`rounded-xl border border-slate-200 p-3 ${
                  dragIndex === i ? "opacity-60 ring-2 ring-slate-900" : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {rows.length > 1 && <DragHandle props={handleProps(i)} className="h-14 w-6" />}
                  {id ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`}
                      alt=""
                      className="h-14 w-24 shrink-0 rounded-lg border border-slate-200 object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-[10px] text-slate-500">
                      No preview
                    </span>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <input
                      aria-label={`Video ${i + 1} YouTube link`}
                      value={v.url}
                      onChange={(e) => update(v.uid, { url: e.target.value })}
                      placeholder="https://www.youtube.com/shorts/..."
                      className={`${inputBase} w-full`}
                    />
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-xs font-medium text-slate-500">Batch #</span>
                      <input
                        aria-label={`Video ${i + 1} batch number`}
                        value={v.batch}
                        onChange={(e) => update(v.uid, { batch: e.target.value })}
                        placeholder="e.g. 12 (optional)"
                        className={`${inputBase} w-40`}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(v.uid, i)}
                    aria-label={`Remove video ${i + 1}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => {
            setRows((r) => [...r, { url: "", batch: "", uid: uidCounter++ }]);
            section.markDirty();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-500 hover:text-slate-900"
        >
          <Icon name="plus" className="h-4 w-4" />
          Add video
        </button>
        <SaveRow section={section} />
      </form>
    </Card>
  );
}

type InterviewRow = { url: string; title: string; uid: number };

export function InterviewsForm({ value }: { value: SiteContent["interviews"] }) {
  const section = useSection(saveInterviews);
  const { confirm, dialog } = useConfirm();
  const [rows, setRows] = useState<InterviewRow[]>(() =>
    value.map((v) => ({
      url: `https://www.youtube.com/watch?v=${v.id}`,
      title: v.title,
      uid: uidCounter++,
    }))
  );

  const update = (uid: number, patch: Partial<InterviewRow>) => {
    setRows((r) => r.map((v) => (v.uid === uid ? { ...v, ...patch } : v)));
    section.markDirty();
  };
  const { setContainer, handleProps, dragIndex } = useReorder((from, to) => {
    setRows((r) => arrayMove(r, from, to));
    section.markDirty();
  });
  const remove = async (uid: number, index: number) => {
    const ok = await confirm({
      title: `Remove interview ${index + 1}?`,
      message: "Its section leaves the home page after you save changes.",
    });
    if (!ok) return;
    setRows((r) => r.filter((v) => v.uid !== uid));
    section.markDirty();
  };

  return (
    <Card
      id="interviews"
      icon="play"
      title="TV interviews"
      description="Each interview gets its own section on the home page, right before 'Ready to join?'. The title becomes the section heading. The sections stay hidden while this list is empty."
      section={section}
    >
      {dialog}
      <form action={section.formAction} className="space-y-4">
        <input
          type="hidden"
          name="interviews"
          value={JSON.stringify(rows.map((v) => ({ url: v.url, title: v.title })))}
        />

        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
            No interviews yet. Click &ldquo;Add interview&rdquo; below, paste a YouTube link, give
            it a title, and save.
          </p>
        ) : (
          <p className="text-xs font-medium text-slate-500">
            {rows.length} {rows.length === 1 ? "interview" : "interviews"}
            {rows.length > 1 && <> · drag the handle to reorder</>}
          </p>
        )}
        <ul ref={setContainer} className="space-y-2.5">
          {rows.map((v, i) => {
            const id = parseYoutubeId(v.url);
            return (
              <li
                key={v.uid}
                data-reorder-item
                className={`rounded-xl border border-slate-200 p-3 ${
                  dragIndex === i ? "opacity-60 ring-2 ring-slate-900" : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {rows.length > 1 && <DragHandle props={handleProps(i)} className="h-14 w-6" />}
                  {id ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`}
                      alt=""
                      className="h-14 w-24 shrink-0 rounded-lg border border-slate-200 object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-[10px] text-slate-500">
                      No preview
                    </span>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <input
                      aria-label={`Interview ${i + 1} YouTube link`}
                      value={v.url}
                      onChange={(e) => update(v.uid, { url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className={`${inputBase} w-full`}
                    />
                    <input
                      aria-label={`Interview ${i + 1} title`}
                      value={v.title}
                      onChange={(e) => update(v.uid, { title: e.target.value })}
                      placeholder="e.g. Interview on 365 News with Nadia Khan"
                      className={`${inputBase} w-full`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(v.uid, i)}
                    aria-label={`Remove interview ${i + 1}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => {
            setRows((r) => [...r, { url: "", title: "", uid: uidCounter++ }]);
            section.markDirty();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-500 hover:text-slate-900"
        >
          <Icon name="plus" className="h-4 w-4" />
          Add interview
        </button>
        <SaveRow section={section} />
      </form>
    </Card>
  );
}

export function SocialsForm({ value }: { value: SiteContent["socials"] }) {
  const section = useSection(saveSocials);
  const initial = (label: string) => value.find((s) => s.label === label)?.href || "";
  const [urls, setUrls] = useState<Record<string, string>>(
    Object.fromEntries(SOCIAL_FIELDS.map((s) => [s.name, initial(s.label)]))
  );

  return (
    <Card
      id="socials"
      icon="link"
      title="Social links"
      description="The icons in the footer. Leave a field empty to hide that icon."
      section={section}
    >
      <form action={section.formAction} onChange={section.markDirty} className="space-y-3">
        {SOCIAL_FIELDS.map((s) => (
          <div key={s.name} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600">
              <Icon name={s.icon} className="h-4 w-4" />
            </span>
            <input
              aria-label={`${s.label} link`}
              name={s.name}
              value={urls[s.name]}
              onChange={(e) => setUrls({ ...urls, [s.name]: e.target.value })}
              placeholder={`https://... (${s.label})`}
              className={inputClass}
            />
          </div>
        ))}
        <SaveRow section={section} />
      </form>
    </Card>
  );
}
