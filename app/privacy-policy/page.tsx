import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses, and protects your personal information when you visit the site or enroll in the course.`,
  alternates: { canonical: "/privacy-policy" },
};

const sections: LegalSection[] = [
  {
    heading: "Information we collect",
    blocks: [
      "We only collect the information we need to enroll you and run your training. That includes:",
      {
        list: [
          "Your name, phone / WhatsApp number, and city when you fill in the enrollment form or message us.",
          "Your payment screenshot and the sender's name when you pay the course fee, so we can confirm your enrollment.",
          "Messages you send to our support team or in your batch WhatsApp group.",
          "Basic technical information every website receives automatically, such as your IP address and browser type, kept in standard server logs.",
        ],
      },
      "We do not collect bank card numbers, passwords to your accounts, or any information we don't need for the course.",
    ],
  },
  {
    heading: "How we use your information",
    blocks: [
      {
        list: [
          "To confirm your payment and reserve your seat in a batch.",
          "To add you to your batch WhatsApp group, where class links and updates are shared.",
          "To deliver live classes, course materials, and product lists.",
          "To answer your questions and provide 24/7 support, including after the course ends.",
          "To send your commissions to the account you give us after your customers' orders are delivered.",
          "To share occasional updates about batches and the community.",
        ],
      },
    ],
  },
  {
    heading: "Cookies and advertising (Meta Pixel)",
    blocks: [
      "We advertise this course on Facebook and Instagram. To measure those ads, this site can use the Meta Pixel, a small piece of code from Meta Platforms that sets cookies and tells us — and Meta — which pages you visited and whether you contacted us on WhatsApp after seeing an ad. Meta may use this data in line with its own privacy policy, including to improve ad delivery.",
      "The pixel runs on every visit to this site, and a notice on your first visit tells you so. Dismissing that notice only hides it — it does not turn the pixel on or off.",
      "If you would rather not be measured this way, you can block it: use your browser's tracking-protection or cookie settings to block third-party cookies from facebook.net, or use any ad blocker. You can also control how Meta uses data about you from its ad partners in your Facebook settings, under \"Your ad preferences\".",
      "We do not run the pixel on our admin pages.",
    ],
  },
  {
    heading: "WhatsApp and third-party services",
    blocks: [
      "Most of our communication happens on WhatsApp, which is operated by Meta. Messages you send on WhatsApp are also governed by WhatsApp's own privacy policy and terms.",
      "Videos on this site are embedded from YouTube (Google), which may set cookies and collect viewing data when you play them. Links to our Instagram, TikTok, YouTube, and X profiles take you to those platforms, which have their own policies.",
      "Course fees are paid by direct bank transfer or mobile wallet to the accounts shown on the enroll page. Your bank or wallet provider processes that payment under its own terms — we only receive the transfer and your confirmation screenshot.",
    ],
  },
  {
    heading: "Sharing your information",
    blocks: [
      "We never sell your personal information. It is only shared with:",
      {
        list: [
          "Our own support and admin team, so they can enroll you and help you.",
          "Service providers that host this website and store its data.",
          "Meta, for ad measurement, as described above.",
          "Authorities, if the law requires us to.",
        ],
      },
    ],
  },
  {
    heading: "How long we keep it",
    blocks: [
      "We keep your enrollment and payment records while you are a student and for as long as we reasonably need them for business and legal records. You can ask us to delete your information at any time, and we will remove everything we are not legally required to keep.",
    ],
  },
  {
    heading: "Security",
    blocks: [
      "Access to student information is limited to our team. The site's admin area is protected with passwords and two-factor authentication. No online service can promise perfect security, but we keep the information we hold to a minimum and protect it carefully.",
    ],
  },
  {
    heading: "Your rights",
    blocks: [
      "You can ask us at any time to show you the information we hold about you, correct it, or delete it. Just message our support team on WhatsApp and we will take care of it.",
    ],
  },
  {
    heading: "Children",
    blocks: [
      "This site and course are not directed at children under 13. If you believe a child has given us personal information, contact us and we will delete it.",
    ],
  },
  {
    heading: "Changes to this policy",
    blocks: [
      "If we change this policy, we will post the new version on this page with a new effective date. Continuing to use the site or course after a change means you accept the updated policy.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`This policy explains what information ${site.name} collects when you visit ${site.url.replace("https://", "")} or enroll in the course, how we use it, and the choices you have.`}
      sections={sections}
    />
  );
}
