import type { SiteContent } from "./content";
import { faqs, instructor, site, socials, WHATSAPP_NUMBER } from "./site";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/logo.png`,
  sameAs: socials.map((s) => s.href),
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    telephone: `+${WHATSAPP_NUMBER}`,
    availableLanguage: ["en", "ur"],
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
};

export const courseSchema = (pricing: SiteContent["pricing"]) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Launch Your Instagram eCommerce Business in 30 Days",
  description: site.description,
  url: `${site.url}/course`,
  provider: {
    "@type": "Organization",
    name: site.name,
    url: site.url,
  },
  instructor: {
    "@type": "Person",
    name: instructor.name,
    jobTitle: instructor.role,
  },
  inLanguage: "en",
  offers: {
    "@type": "Offer",
    price: pricing.current,
    priceCurrency: "PKR",
    availability: "https://schema.org/LimitedAvailability",
    url: `${site.url}/enroll`,
    category: "Paid",
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Online",
    courseWorkload: "PT4H",
    instructor: {
      "@type": "Person",
      name: instructor.name,
    },
  },
});

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: instructor.name,
  jobTitle: instructor.role,
  description: instructor.bio,
  image: `${site.url}/shoaib-zareen.jpg`,
  url: `${site.url}/about`,
  worksFor: {
    "@type": "Organization",
    name: site.name,
    url: site.url,
  },
  sameAs: socials.map((s) => s.href),
};

export const heroVideoSchema = (videoId: string) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Shoaib Zareen featured on HUM News: Instagram eCommerce in Pakistan",
  description:
    "Shoaib Zareen explains on HUM News how ordinary Pakistanis are earning online with Instagram eCommerce.",
  thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  uploadDate: "2025-01-01",
  embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
});
