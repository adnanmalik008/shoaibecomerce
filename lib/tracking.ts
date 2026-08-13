// Client-side Meta Pixel helpers. The pixel itself is loaded by
// components/MetaPixel.tsx once the visitor has consented; everything here is
// safe to call unconditionally — calls are dropped until fbq exists.
//
// Consent model (site targets ads worldwide, including the EU/UK):
//   "granted"  — visitor accepted the banner; pixel loads and events fire
//   "denied"   — visitor declined; nothing loads, choice is remembered
//   null       — no choice yet; banner is shown, nothing loads

export const CONSENT_STORAGE_KEY = "tracking-consent";

// Fired on window when the visitor makes a choice so the pixel loader can
// react without a page reload.
export const CONSENT_EVENT = "tracking-consent-change";

export type TrackingConsent = "granted" | "denied";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function getConsent(): TrackingConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null; // storage blocked: treat as undecided, never track
  }
}

export function setConsent(value: TrackingConsent) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // storage blocked: the choice just won't persist across visits
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
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
