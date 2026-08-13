import { getContent } from "@/lib/content";
import { Icon } from "@/components/icons";
import {
  GalleryForm,
  GuaranteeForm,
  HeroForm,
  InterviewsForm,
  LiveClassesForm,
  PaymentForm,
  PricingForm,
  SectionVisibilityForm,
  SocialsForm,
  TeamForm,
  TickerForm,
  VideosForm,
  WhatsappForm,
} from "@/components/admin/forms";

const NAV = [
  {
    group: "Home page",
    items: [
      { id: "section-visibility", label: "Visibility", icon: "eye" },
      { id: "hero", label: "Hero", icon: "type" },
      { id: "videos", label: "Videos", icon: "play" },
      { id: "interviews", label: "TV interviews", icon: "play" },
      { id: "ticker", label: "Ticker", icon: "megaphone" },
    ],
  },
  {
    group: "Screenshots",
    items: [
      { id: "gallery-payouts", label: "Payouts", icon: "image" },
      { id: "gallery-earnings", label: "Earnings", icon: "image" },
      { id: "gallery-training", label: "Testimonials", icon: "image" },
      { id: "live-classes", label: "Live classes", icon: "play" },
    ],
  },
  {
    group: "Offer",
    items: [
      { id: "pricing", label: "Pricing", icon: "wallet" },
      { id: "payment", label: "Payment methods", icon: "bank" },
      { id: "guarantee", label: "Guarantee", icon: "shield" },
    ],
  },
  {
    group: "Contact",
    items: [
      { id: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
      { id: "team", label: "Support team", icon: "headset" },
      { id: "socials", label: "Social links", icon: "link" },
    ],
  },
];

export default async function AdminPage() {
  const content = await getContent();

  return (
    <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-8">
      {/* Mobile: horizontal chip nav */}
      <nav
        aria-label="Sections"
        className="sticky top-16 z-20 -mx-4 mb-5 border-b border-slate-200 bg-slate-50/95 py-2.5 backdrop-blur lg:hidden"
      >
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV.flatMap((g) => g.items).map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900"
              >
                <Icon name={item.icon} className="h-3.5 w-3.5" />
                {item.label}
              </a>
            ))}
          </div>
          {/* fade hints there is more to scroll */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50 to-transparent" />
        </div>
      </nav>

      {/* Desktop: side rail */}
      <nav aria-label="Sections" className="hidden lg:block">
        <div className="sticky top-20 space-y-5">
          {NAV.map((g) => (
            <div key={g.group}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {g.group}
              </p>
              <ul className="space-y-0.5">
                {g.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                    >
                      <Icon name={item.icon} className="h-4 w-4 text-slate-400" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Sections, in nav order */}
      <div className="space-y-6">
        <SectionVisibilityForm value={content.sectionVisibility} />
        <HeroForm value={content.hero} />
        <VideosForm value={content.videos} />
        <InterviewsForm value={content.interviews} />
        <TickerForm value={content.ticker} />
        <GalleryForm
          galleryKey="payouts"
          title="Payout screenshots"
          description="The payouts Shoaib sends to students. First carousel on the home page."
          value={content.galleries.payouts}
        />
        <GalleryForm
          galleryKey="earnings"
          title="Earning screenshots"
          description="Payment and commission screenshots students share. Shown on home and success stories."
          value={content.galleries.earnings}
        />
        <GalleryForm
          galleryKey="training"
          title="Testimonial screenshots"
          description="Messages from students about the training. Shown on home and success stories."
          value={content.galleries.training}
        />
        <LiveClassesForm value={content.liveClasses} />
        <PricingForm value={content.pricing} />
        <PaymentForm value={content.payment} />
        <GuaranteeForm value={content.guarantee} />
        <WhatsappForm value={content.whatsapp} />
        <TeamForm value={content.supportTeam} />
        <SocialsForm value={content.socials} />
      </div>
    </div>
  );
}
