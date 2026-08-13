export const SECTION_VISIBILITY_GROUPS = [
  {
    label: "Global",
    items: [
      {
        key: "announcementTicker",
        label: "Announcement ticker",
        location: "Top of every page",
      },
    ],
  },
  {
    label: "Home page",
    items: [
      { key: "homeHero", label: "Hero and introduction video", location: "Home page" },
      { key: "fatwa", label: "Fatwa verification", location: "Home page" },
      { key: "interviews", label: "TV interviews", location: "Home page" },
      { key: "enrollment", label: "How to join and payment", location: "Home page" },
      { key: "trainingVideo", label: "Training video", location: "Home page" },
      { key: "instructor", label: "Instructor profile", location: "Home page" },
      { key: "liveClasses", label: "Live class videos", location: "Home page" },
    ],
  },
  {
    label: "Student results",
    items: [
      { key: "payouts", label: "Payout screenshots", location: "Home + Success Stories" },
      { key: "earnings", label: "Earning screenshots", location: "Home + Success Stories" },
      {
        key: "testimonials",
        label: "Training testimonials",
        location: "Home + Success Stories",
      },
    ],
  },
  {
    label: "Offer and contact",
    items: [
      { key: "pricing", label: "Pricing section", location: "Home + Course" },
      { key: "faq", label: "Frequently asked questions", location: "Home + Course" },
      { key: "supportTeam", label: "Support team", location: "Enroll page" },
      { key: "finalCta", label: "Bottom enrollment banner", location: "Public pages" },
    ],
  },
] as const;

export type SectionVisibilityKey =
  (typeof SECTION_VISIBILITY_GROUPS)[number]["items"][number]["key"];

export type SectionVisibility = Record<SectionVisibilityKey, boolean>;

export const SECTION_VISIBILITY_KEYS = SECTION_VISIBILITY_GROUPS.flatMap((group) =>
  group.items.map((item) => item.key)
) as SectionVisibilityKey[];

export const DEFAULT_SECTION_VISIBILITY = Object.fromEntries(
  SECTION_VISIBILITY_KEYS.map((key) => [key, true])
) as SectionVisibility;

export function normalizeSectionVisibility(value: unknown): SectionVisibility {
  const overrides =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return Object.fromEntries(
    SECTION_VISIBILITY_KEYS.map((key) => [
      key,
      typeof overrides[key] === "boolean" ? overrides[key] : true,
    ])
  ) as SectionVisibility;
}
