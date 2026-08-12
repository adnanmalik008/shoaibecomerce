"use client";

import { usePathname } from "next/navigation";
import { Icon } from "./icons";

export function WhatsAppFab({ href }: { href: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const bottomClass = pathname === "/enroll" ? "bottom-5" : "bottom-24 md:bottom-5";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={`fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-emerald-900/20 transition-transform hover:scale-105 hover:bg-whatsapp-dark ${bottomClass}`}
    >
      <Icon name="whatsapp" className="h-7 w-7" />
    </a>
  );
}
