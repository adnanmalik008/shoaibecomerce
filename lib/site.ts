// Single edit point for all site content. Update values here — pages read from this file.

export const site = {
  name: "Shoaib Ecommerce",
  tagline: "First you learn, then you earn.",
  url: "https://shoaibecommerce.com",
  description:
    "Learn to sell on Instagram in 30 days. Live classes with Shoaib Zareen, products already picked for you, delivery handled by our team.",
};

export const WHATSAPP_NUMBER = "923395456000";
export const WHATSAPP_COMMUNITY = "https://chat.whatsapp.com/L44bRCamilx6YvNSnpF336";

// Support team — numbers in local format, converted to wa.me links in the UI
export const supportTeam = [
  { name: "Zahra", phone: "03260351944", role: "Manager" },
  { name: "Sara", phone: "03120773070", role: "Manager" },
  { name: "Asma", phone: "03260944854", role: "Manager" },
  { name: "Nabila", phone: "03027016447" },
  { name: "Eman", phone: "03412875386" },
  { name: "Wajiha", phone: "03490019195" },
  { name: "Aisha", phone: "03469034142" },
  { name: "Sehrish", phone: "03135835759" },
  { name: "Nimra", phone: "03226627305" },
];

export const socials = [
  { label: "Instagram", href: "https://www.instagram.com/instaagramdropshiping", icon: "instagram" },
  { label: "TikTok", href: "https://www.tiktok.com/@shoaibecommerceofficial", icon: "tiktok" },
  { label: "YouTube", href: "https://www.youtube.com/@Shoaibecommercewala", icon: "youtube" },
  { label: "X", href: "https://x.com/shoaibecomerce", icon: "x" },
];

export const videos = {
  hero: {
    youtubeId: "B8GoaQMhZ9Y",
    title: "Launch your Instagram eCommerce business: course introduction",
  },
  story: {
    youtubeId: "hbQfmZCncRs",
    title: "How the training works. Watch before you enroll",
  },
};

export const pricing = {
  original: 20000,
  current: 15000,
  currency: "Rs.",
  seatsLeft: 19,
};

export const guarantee =
  "If you're not earning within 30 days of finishing the course, our 24/7 lifetime support keeps working with you, free, until you are.";

export const stats = [
  { value: "50,000+", label: "Students trained" },
  { value: "$26M+", label: "In organic student sales" },
  { value: "30 days", label: "From zero to first sale" },
];

export const payment = {
  bank: {
    provider: "Faysal Bank",
    accountName: "Muhammad Shoaib Zareen",
    iban: "PK25FAYS3350301000005613",
    accountNumber: "3350301000005613",
    qr: "/payment-qr.jpg",
  },
  wallets: [
    { label: "Easypaisa / JazzCash / NayaPay", accountName: "Muhammad Shoaib Zareen", number: "03105146202" },
    { label: "SadaPay", accountName: "Muhammad Shoaib Zareen", number: "03124560007" },
  ],
  binance: {
    accountName: "Hamad-malik07",
    id: "533086551",
    qr: "/binance-qr.jpeg",
  },
  note: "After payment, send a screenshot on WhatsApp for confirmation.",
};

// TV interviews shown as full-width sections before "Ready to join?" on the
// home page. Editable from the admin dashboard; hidden while the list is empty.
export const interviews = [
  {
    id: "ymwT8QwwaBk",
    title: "Interview on 365 News with Nadia Khan",
  },
  {
    id: "SybseB88ZL0",
    title: "Latest Interview With Mishi Khan on Kay2TV",
  },
];

// Reel-style clips from live classes. Videos are YouTube IDs, added via the
// admin dashboard; the section stays hidden while the list is empty.
export const liveClasses = {
  heading: "Live class snapshots",
  subheading: "Short clips recorded inside our live training sessions.",
  videos: [] as { id: string; batch: string }[],
};

export const fatwa = {
  authority: "Darul Ifta, Jamia Uloom-ul-Islamia Banuri Town, Karachi",
  number: "144012201985",
  issued: "19 November 2019",
  url: "https://www.banuri.edu.pk/readquestion/branded-ghariyon-ki-copy-farokht-karna-144012201985/13-06-2020",
  summary:
    "Selling copy products is permissible in Islam when the customer is clearly told the item is a copy and is charged the copy price. That honest, transparent model is exactly what this course teaches.",
  urduReference: "ماخذ: دار الافتاء جامعۃ العلوم الاسلامیۃ بنوری ٹاؤن",
  urduDetail: "فتوی نمبر: 144012201985 · تاریخ اجراء: 19-11-2019",
  urduText:
    "صورتِ مسئولہ میں برانڈڈ گھڑیوں کی کاپی (فرسٹ یا سیکنڈ کاپی) فروخت کرتے ہوئے اگر گاہک کو بتادیا جائے کہ یہ اصل (برانڈڈ) نہیں اور قیمت بھی نقل (کاپی) والی وصول کی جائے تو اس کا کاروبار کرنا جائز ہے، اور اگر گاہک کو لاعلم رکھ کر کاپی (نقل) فروخت کی جائے اور قیمت اصل (برانڈڈ) والی وصول کی جائے تو ایسا کرنا ناجائز اور دھوکا دہی ہے اور ایسی کمائی میں نقل (کاپی) کے بقدر قیمت تو حلال ہوگی، اس سے زائد قیمت فروخت کرنے والے کے لیے حرام ہوگی۔",
  arabicSource: "الدر المختار شرح تنوير الأبصار في فقه مذهب الإمام أبي حنيفة (5 / 47):",
  arabicText:
    "\"فروع: لايحل كتمان العيب في مبيع أو ثمن؛ لأن الغش حرام إلا في مسألتين: الأولى الأسير إذا شرى شيئًا ثمة ودفع الثمن مغشوشًا جاز إن كان حرًّا لا عبدًا. الثانية يجوز إعطاء الزيوف والناقص في الجبايات، أشباه\". فقط والله أعلم",
};

export const enrollSteps = [
  "Fill in your details and continue on WhatsApp",
  "Get the payment details and pay the batch fee",
  "Send your payment screenshot with your name",
  "Get added to your batch group, where classes and updates are shared",
];

export const instructor = {
  name: "Shoaib Zareen",
  role: "Founder & Lead Trainer",
  bio: "Shoaib Zareen started with no stock, no ad budget, and no one to teach him. The Instagram business he built from that crossed several million dollars in sales, and this course is the method behind it. Over 50,000 students have been through his training so far. Between them, they've sold more than $26 million worth of products, all organically, without paid ads.",
  quote: "First you learn, then you earn.",
  milestones: [
    { title: "Built a multi-million dollar Instagram business", detail: "No inventory, no paid ads. The exact model this course teaches." },
    { title: "Trained 50,000+ students", detail: "Most started as complete beginners. Many now earn full-time, in Pakistan and abroad." },
    { title: "$26M+ generated by students", detail: "That's the combined organic sales of students who applied what the course teaches. No paid ads." },
    { title: "Live, hands-on teaching", detail: "Every batch gets live classes where you can ask questions and get real answers. Nothing is recording-only." },
  ],
};

export const features = [
  {
    title: "Ready-to-sell products",
    description: "You get proven products from day one. No hunting for suppliers, no guessing what will sell.",
    icon: "package",
  },
  {
    title: "Fulfillment handled for you",
    description: "Our team packs and delivers every order. Your only job is bringing in the customer.",
    icon: "truck",
  },
  {
    title: "Zero inventory investment",
    description: "You never buy stock or hold products. There's nothing to invest in upfront.",
    icon: "wallet",
  },
  {
    title: "No paid ads needed",
    description: "Learn to get customers from Instagram without spending a rupee on advertising.",
    icon: "megaphone",
  },
  {
    title: "Verified PayPal access",
    description: "Get access to a verified PayPal account for secure international transactions in your business.",
    icon: "shield",
  },
  {
    title: "24/7 lifetime support",
    description: "The batch group stays active long after the course ends. Ask anytime, someone answers.",
    icon: "headset",
  },
];

export const steps = [
  {
    title: "Learn",
    description: "4 live classes over 30 days. You build your store and learn how to find customers on Instagram without ads.",
  },
  {
    title: "Launch",
    description: "Go live with a ready store and proven products. Every order you bring in, our team delivers.",
  },
  {
    title: "Earn",
    description: "When your customer's order is delivered, your commission goes straight to your account. Most students see their first payment within a week or two of finishing.",
  },
];

export const curriculum = [
  {
    week: 1,
    title: "Store setup & foundations",
    description: "Set up your Instagram storefront properly, from your profile to the tools you'll need. The live class walks you through it step by step.",
    points: ["Instagram business account setup", "Store positioning and niche", "Tools and accounts you need"],
  },
  {
    week: 2,
    title: "Product research & selection",
    description: "Learn what makes a product sell, then get our vetted product list so you skip the trial and error completely.",
    points: ["What makes a product sell", "Access to pre-vetted products", "Pricing for commission"],
  },
  {
    week: 3,
    title: "Organic marketing & sales",
    description: "How to get customers without spending on ads, and how to close the sale once they message you. This is the core skill of the whole business.",
    points: ["Organic reach strategies", "Content that converts", "Closing sales in DMs"],
  },
  {
    week: 4,
    title: "Orders, delivery & commissions",
    description: "What happens after someone orders: how our team handles delivery, and how your commission reaches your account.",
    points: ["Order handling end to end", "PayPal and payments", "Getting paid your commission"],
  },
];

export const included = [
  "4 live classes (one per week, 10 PM)",
  "Pre-vetted, ready-to-sell products",
  "Fulfillment handled by our team",
  "Verified PayPal account access",
  "24/7 lifetime support",
  "Batch WhatsApp group with daily updates",
  "Marketing playbook that needs no ad budget",
  "Direct commission payouts after delivery",
];

export const faqs = [
  {
    q: "What does the training include?",
    a: "You attend 4 live classes over one month, one per week at 10 PM. They cover building your store, choosing products, getting customers, and handling orders. You can ask the mentor questions in every class.",
  },
  {
    q: "Can I do this from anywhere?",
    a: "Yes. Everything is online. A phone and an internet connection are all you need.",
  },
  {
    q: "Do I need to buy products or hold inventory?",
    a: "No. We give you ready-to-sell products and our team packs and delivers every order. You never touch inventory.",
  },
  {
    q: "Which payment gateway will I use?",
    a: "You get access to a verified PayPal account, ready to use for international payments in your business.",
  },
  {
    q: "When can I start earning?",
    a: "Students who follow the training properly usually start earning within a week or two of finishing.",
  },
  {
    q: "How do I receive my commission?",
    a: "After your customer's order is delivered, we send your commission to whatever account you give us.",
  },
  {
    q: "How much is the fee and how do I pay?",
    a: `The course is currently Rs. 15,000 (regular price Rs. 20,000). Pay by bank transfer to the account shown on the enroll page, then send your payment screenshot with your name and the sender's name on WhatsApp to get enrolled.`,
  },
  {
    q: "What happens after I pay?",
    a: "Send your payment screenshot, your name, and the sender name on WhatsApp. You'll be added to your batch group, where all class links, updates, and instructions are shared.",
  },
  {
    q: "Is there a community I can join for updates?",
    a: "Yes. There's an official WhatsApp community with daily updates. The join link is on this site.",
  },
  {
    q: "Do I need paid ads to get customers?",
    a: "No. The whole method is organic. You learn to bring in customers without spending a rupee on ads.",
  },
];

export const nav = [
  { label: "Home", href: "/" },
  { label: "Course", href: "/course" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "About", href: "/about" },
];

export const legalNav = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Refund Policy", href: "/refund-policy" },
];
