import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `When course fees paid to ${site.name} can be refunded, when they can't, and how to request a refund.`,
  alternates: { canonical: "/refund-policy" },
};

const sections: LegalSection[] = [
  {
    heading: "The short version",
    blocks: [
      "Your course fee reserves a seat in a live batch. You can get a full refund any time before your batch's first live class. Once your batch starts and you receive access to classes and materials, the fee is no longer refundable — but our lifetime support keeps working with you for free until you earn.",
    ],
  },
  {
    heading: "When you can get a refund",
    blocks: [
      "We refund the full course fee when:",
      {
        list: [
          "You cancel before attending the first live class of your batch.",
          "You paid twice by mistake, or paid more than the course fee — the extra amount is returned.",
          "We cancel a batch, or reschedule it in a way that doesn't work for you, and you choose not to join a later batch.",
        ],
      },
    ],
  },
  {
    heading: "When the fee is not refundable",
    blocks: [
      "Because a seat and live teaching are committed to you, the fee is not refundable when:",
      {
        list: [
          "Your batch has started and you have attended a class, or received course materials, recordings, or product lists.",
          "You stop attending classes or change your mind after the batch is underway.",
          "You were removed from the course for breaking the Terms & Conditions, such as sharing course content or misbehaving in groups.",
        ],
      },
    ],
  },
  {
    heading: "Not earning yet? That's what the guarantee is for",
    blocks: [
      "If you finish the course and are not earning within 30 days, the answer is not a refund — it is more help, free. Our 24/7 lifetime support keeps working with you until you make your first earnings. Message your batch group or the support team and we will pick it up from there.",
    ],
  },
  {
    heading: "How to request a refund",
    blocks: [
      {
        list: [
          "Message our support team on WhatsApp within the refund window.",
          "Send your payment screenshot, the sender's name, and the name you enrolled with.",
          "We verify the payment and confirm your refund on WhatsApp.",
        ],
      },
    ],
  },
  {
    heading: "How refunds are paid",
    blocks: [
      "Approved refunds are sent back to the same bank account or wallet the payment came from, normally within 7–14 business days. Bank and wallet processing times are outside our control, but we will keep you updated until the money reaches you.",
    ],
  },
  {
    heading: "Changes to this policy",
    blocks: [
      "If we change this policy, the new version will be posted on this page with a new effective date. The policy in force when you paid is the one that applies to your enrollment.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro={`This policy explains when course fees paid to ${site.name} are refunded, when they are not, and exactly how to ask for one.`}
      sections={sections}
    />
  );
}
