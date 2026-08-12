"use client";

import { useState } from "react";
import { waHref } from "@/lib/wa";
import { Icon } from "./icons";

export function LeadForm({ whatsappNumber }: { whatsappNumber: string }) {
  const [form, setForm] = useState({ name: "", city: "", question: "" });
  const [error, setError] = useState("");

  const update = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Enter your name to continue.");
      return;
    }
    setError("");

    const lines = [
      "Hi! I want to enroll in the 30-day Instagram eCommerce training.",
      `Name: ${form.name.trim()}`,
    ];
    if (form.city.trim()) lines.push(`City: ${form.city.trim()}`);
    if (form.question.trim()) lines.push(`Question: ${form.question.trim()}`);

    window.open(waHref(whatsappNumber, lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="lead-name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Full name
        </label>
        <input
          id="lead-name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={form.name}
          onChange={update("name")}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="lead-city" className="mb-1.5 block text-sm font-medium text-slate-700">
          City <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="lead-city"
          type="text"
          autoComplete="address-level2"
          placeholder="e.g. Lahore"
          value={form.city}
          onChange={update("city")}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="lead-question" className="mb-1.5 block text-sm font-medium text-slate-700">
          Your question <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="lead-question"
          rows={3}
          placeholder="Anything you want to ask before joining?"
          value={form.question}
          onChange={update("question")}
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-whatsapp px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-whatsapp-dark"
      >
        <Icon name="whatsapp" className="h-5 w-5" />
        Continue on WhatsApp
      </button>
      <p className="text-center text-xs text-slate-400">
        Opens WhatsApp with your details pre-filled. Your number is shared
        automatically by WhatsApp, no need to type it.
      </p>
    </form>
  );
}
