// Client-safe WhatsApp link helpers. Numbers come from admin-editable content,
// so these take the number as an argument instead of importing a constant.

export const DEFAULT_WA_MESSAGE =
  "Hi! I visited shoaibecomerce.com and I want to enroll in the 30-day Instagram eCommerce training.";

/** number in international format without +, e.g. 923395456000 */
export const waHref = (number: string, text = DEFAULT_WA_MESSAGE) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

/** phone in local Pakistani format, e.g. 03260351944 */
export const localWaHref = (phone: string, text = DEFAULT_WA_MESSAGE) =>
  `https://wa.me/92${phone.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(text)}`;
