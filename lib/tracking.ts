// Client-side Meta Pixel helpers. The pixel itself is loaded by
// components/MetaPixel.tsx; everything here is safe to call unconditionally —
// calls are dropped until fbq exists.
//
// Tracking model: the pixel loads for every visitor as soon as the page does.
// components/TrackingNotice.tsx tells the visitor this is happening and links
// to the privacy policy; dismissing that notice only hides it, it does not
// switch tracking on or off. The storage key below records that dismissal.

export const NOTICE_STORAGE_KEY = "tracking-notice";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function isNoticeDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(NOTICE_STORAGE_KEY) === "dismissed";
  } catch {
    return false; // storage blocked: the notice simply shows again next visit
  }
}

export function dismissNotice() {
  try {
    localStorage.setItem(NOTICE_STORAGE_KEY, "dismissed");
  } catch {
    // storage blocked: the dismissal just won't persist across visits
  }
}

/** Fire a standard Meta Pixel event. No-op until the pixel is loaded. */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (params) window.fbq("track", event, params);
  else window.fbq("track", event);
}

/**
 * Meta standard Lead event. On this site every conversion is a WhatsApp
 * handoff, so this is called wherever a visitor leaves for WhatsApp with
 * enrollment intent.
 */
export function trackLead(source: string) {
  track("Lead", { content_name: source });
}
