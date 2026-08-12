"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

// Reusable screenshot carousel: auto-loops horizontally, pauses on hover,
// drag to scroll (mouse + touch), click opens a lightbox gallery.
// Takes the image URL list directly (admin-managed via lib/content galleries).
// With video, entries are YouTube video IDs: cards show a 9:16 thumbnail with
// a play badge and the lightbox plays the video.
export function ScreenshotTestimonials({
  images,
  altLabel = "Student feedback screenshot",
  video = false,
  labels,
}: {
  images: string[];
  altLabel?: string;
  video?: boolean;
  // optional per-image badge text, aligned by index (used for live class batches)
  labels?: string[];
}) {
  const files = images;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // when one copy of the cards already fits the container, there is nothing to
  // scroll: render a centered static row with no loop, drag, or arrows
  const [isStatic, setIsStatic] = useState(false);

  // ~7s per image; doubled track wraps at -50% for a seamless loop
  const duration = files.length * 7;

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0); // current translateX, kept in (-half, 0]
  const halfRef = useRef(0); // width of one copy of the track
  const staticRef = useRef(false); // mirrors isStatic for the rAF loop
  const hoverRef = useRef(false);
  const draggingRef = useRef(false);
  const velocityRef = useRef(0); // px/s, momentum after drag release
  const suppressClickRef = useRef(false);
  const drag = useRef({ pointerId: 0, startX: 0, lastX: 0, lastT: 0 });

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    const measure = () => {
      // the static layout renders a single copy of the cards, the loop two
      const single = track.scrollWidth / (staticRef.current ? 1 : 2);
      halfRef.current = single;
      const shouldBeStatic = single <= container.clientWidth + 1;
      if (shouldBeStatic !== staticRef.current) {
        staticRef.current = shouldBeStatic;
        offsetRef.current = 0;
        velocityRef.current = 0;
        track.style.transform = "";
        setIsStatic(shouldBeStatic);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(container);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.1);
      prev = now;
      const half = halfRef.current;

      if (staticRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (!draggingRef.current) {
        if (Math.abs(velocityRef.current) > 20) {
          // glide after a flick, decaying toward auto-scroll speed
          offsetRef.current += velocityRef.current * dt;
          velocityRef.current *= Math.pow(0.02, dt);
        } else if (!hoverRef.current && !reduced && half > 0) {
          offsetRef.current -= (half / duration) * dt;
        }
      }

      if (half > 0) {
        // wrap into (-half, 0] so the doubled track loops seamlessly
        offsetRef.current = -((((-offsetRef.current) % half) + half) % half);
        track.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [duration]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    velocityRef.current = 0;
    suppressClickRef.current = false;
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      lastX: e.clientX,
      lastT: performance.now(),
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || e.pointerId !== drag.current.pointerId) return;
    const now = performance.now();
    const dx = e.clientX - drag.current.lastX;
    const dt = (now - drag.current.lastT) / 1000;
    offsetRef.current += dx;
    if (dt > 0) {
      // low-pass filter so release velocity reflects the recent flick
      velocityRef.current = velocityRef.current * 0.8 + (dx / dt) * 0.2;
    }
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
    if (!suppressClickRef.current && Math.abs(e.clientX - drag.current.startX) > 8) {
      suppressClickRef.current = true;
      // capture only once it's a real drag, so plain clicks stay native
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || e.pointerId !== drag.current.pointerId) return;
    draggingRef.current = false;
    // stale flick (finger held still before release) should not glide
    if (performance.now() - drag.current.lastT > 100) velocityRef.current = 0;
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  };

  // arrow press: velocity impulse that decays through the same physics as a
  // flick; step * 3.9 ≈ -ln(0.02) so total glide lands about one card over
  const nudge = (dir: 1 | -1) => {
    const step = halfRef.current / files.length;
    velocityRef.current = dir * step * 3.9;
  };

  return (
    <>
      {/* edge to edge: place outside any max-width container */}
      <div
        ref={containerRef}
        className={`relative w-full select-none overflow-hidden ${
          isStatic ? "" : "cursor-grab touch-pan-y active:cursor-grabbing"
        }`}
        onPointerDown={isStatic ? undefined : onPointerDown}
        onPointerMove={isStatic ? undefined : onPointerMove}
        onPointerUp={isStatic ? undefined : endDrag}
        onPointerCancel={isStatic ? undefined : endDrag}
        onClickCapture={onClickCapture}
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
      >
        <div
          ref={trackRef}
          className={`flex gap-4 ${
            isStatic ? "w-full justify-center px-4" : "w-max will-change-transform"
          }`}
        >
          {(isStatic ? files : [...files, ...files]).map((file, i) => (
            <button
              key={`${file}-${i}`}
              type="button"
              onClick={() => setOpenIndex(i % files.length)}
              className="relative block w-40 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-transform hover:scale-[1.03] hover:shadow-md sm:w-52"
              tabIndex={i < files.length ? 0 : -1}
              aria-hidden={i >= files.length}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video ? `https://i.ytimg.com/vi/${file}/hqdefault.jpg` : file}
                alt={i < files.length ? `${altLabel} ${i + 1}` : ""}
                loading="lazy"
                draggable={false}
                className={video ? "aspect-[9/16] w-full object-cover" : "h-auto w-full"}
              />
              {video && (
                <span className="absolute inset-0 flex items-center justify-center bg-slate-950/20">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg">
                    <Icon name="play" className="h-5 w-5 translate-x-0.5" />
                  </span>
                </span>
              )}
              {video && labels?.[i % files.length]?.trim() && (
                <span className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-slate-950/85 to-transparent p-3">
                  <span className="rounded-full bg-emerald-500 px-4 py-1.5 text-base font-extrabold text-white shadow-lg ring-2 ring-white/50">
                    Batch #{labels[i % files.length].trim()}
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>

        {!isStatic && (
          <>
            <button
              type="button"
              aria-label="Scroll back"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                nudge(1);
              }}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-slate-900 sm:left-4"
            >
              <Icon name="arrow" className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Scroll forward"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                nudge(-1);
              }}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-slate-900 sm:right-4"
            >
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {openIndex > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpenIndex(openIndex - 1); }}
              aria-label="Previous"
              className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4"
            >
              <Icon name="arrow" className="h-5 w-5 rotate-180" />
            </button>
          )}
          {openIndex < files.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpenIndex(openIndex + 1); }}
              aria-label="Next"
              className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4"
            >
              <Icon name="arrow" className="h-5 w-5" />
            </button>
          )}

          {video ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="aspect-[9/16] max-h-[85vh] w-auto max-w-full overflow-hidden rounded-2xl bg-slate-900 shadow-2xl"
            >
              <iframe
                key={files[openIndex]}
                src={`https://www.youtube-nocookie.com/embed/${files[openIndex]}?autoplay=1&playsinline=1&rel=0`}
                title={`${altLabel} ${openIndex + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={files[openIndex]}
              alt={`${altLabel} ${openIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          )}

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {video && labels?.[openIndex]?.trim() && (
              <span className="rounded-full bg-emerald-500 px-4 py-1.5 text-base font-extrabold text-white shadow-lg ring-2 ring-white/50">
                Batch #{labels[openIndex].trim()}
              </span>
            )}
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              {openIndex + 1} / {files.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
