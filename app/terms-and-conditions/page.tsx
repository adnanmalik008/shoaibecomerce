import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms that apply when you use ${site.name} or enroll in the 30-day Instagram eCommerce training.`,
  alternates: { canonical: "/terms-and-conditions" },
};

const sections: LegalSection[] = [
  {
    heading: "Agreeing to these terms",
    blocks: [
      `These terms are an agreement between you and ${site.name}. By using this website, enrolling in the course, or joining any of our WhatsApp groups, you accept them. If you do not agree, please do not enroll.`,
    ],
  },
  {
    heading: "What the course is",
    blocks: [
      "The course is a live, online Instagram eCommerce training. A batch normally includes:",
      {
        list: [
          "4 live classes over about 30 days, held at the scheduled class time.",
          "A batch WhatsApp group where class links, materials, and updates are shared.",
          "Access to pre-vetted, ready-to-sell products.",
          "Order fulfillment handled by our team for sales you bring in.",
          "Commission payouts after your customers' orders are delivered.",
          "Ongoing support after the course ends.",
        ],
      },
      "Exact schedules, batch dates, and inclusions are announced in your batch group and may be adjusted from time to time.",
    ],
  },
  {
    heading: "Enrollment and payment",
    blocks: [
      "To enroll, you pay the course fee shown on the enroll page to one of the official accounts listed there, then send your payment screenshot with your name on WhatsApp. Your seat is confirmed when we verify the payment and add you to your batch group.",
      "Only pay to the accounts listed on this website. We are not responsible for payments sent to any other account. Refunds are governed by our Refund Policy.",
    ],
  },
  {
    heading: "Your responsibilities",
    blocks: [
      {
        list: [
          "Give us accurate information when you enroll.",
          "Attend the live classes and do the work — results come from applying the training.",
          "Sell honestly. The course teaches transparent selling, including always telling customers exactly what a product is before they buy.",
          "Keep class links, group links, and course materials to yourself.",
          "Treat mentors, our team, and other students respectfully in classes and groups.",
        ],
      },
    ],
  },
  {
    heading: "Course materials and intellectual property",
    blocks: [
      `All course content — live classes, recordings, product lists, playbooks, and materials shared in batch groups — belongs to ${site.name}. It is licensed to you for your personal use only.`,
      "You may not record, copy, share, resell, or publish any part of the course. Students who leak or resell course content are removed from the batch without a refund, and we reserve the right to take further legal action.",
    ],
  },
  {
    heading: "Community rules",
    blocks: [
      "Our WhatsApp groups exist to help students learn and earn. Spam, harassment, scams, promoting other services, or any abusive behavior will get you removed. We may remove anyone from a group or class to protect the rest of the batch.",
    ],
  },
  {
    heading: "Earnings disclaimer",
    blocks: [
      "We teach a method that has worked for thousands of students, but no income is guaranteed. How much you earn depends on your effort, consistency, and market conditions. Student results shown on this site are real but are not a promise that you will earn the same.",
      "Our guarantee is one of support: if you are not earning after finishing the course, our team keeps working with you, free, until you are. It is not a promise of a specific income or a cash refund.",
    ],
  },
  {
    heading: "Commissions and payouts",
    blocks: [
      "Commissions are paid after a customer's order is delivered and confirmed, to the account details you give us. Payout timing can vary with banks and wallet providers. Orders that are cancelled, returned, or refused by the customer do not earn a commission.",
    ],
  },
  {
    heading: "Limitation of liability",
    blocks: [
      "The website and course are provided as they are. To the maximum extent the law allows, we are not liable for indirect losses — including lost profits, actions taken by third-party platforms such as Instagram or WhatsApp (like account restrictions), internet or power outages, or events outside our control. Our total liability for any claim is limited to the course fee you paid us.",
    ],
  },
  {
    heading: "Removal and termination",
    blocks: [
      "We may refuse enrollment or remove a student who breaks these terms, disrupts classes or groups, or misuses course content. If you are removed for a breach, no refund is due. You may leave the course at any time; the Refund Policy explains when a refund applies.",
    ],
  },
  {
    heading: "Changes to these terms",
    blocks: [
      "We may update these terms from time to time. The current version will always be on this page with its effective date. Continuing to use the site or course after a change means you accept the updated terms.",
    ],
  },
  {
    heading: "Governing law",
    blocks: [
      "These terms are governed by the laws of Pakistan, and any dispute will be handled by the courts of Pakistan.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro={`These terms cover your use of ${site.url.replace("https://", "")} and your enrollment in the 30-day Instagram eCommerce training. Please read them before you enroll.`}
      sections={sections}
    />
  );
}
