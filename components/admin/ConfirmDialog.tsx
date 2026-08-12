"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// In-app replacement for window.confirm, styled to match the admin panel.
// Usage: const { confirm, dialog } = useConfirm(); render {dialog}; then
// `if (!(await confirm({ title, message, confirmLabel }))) return;`

type Options = { title: string; message?: string; confirmLabel?: string };

export function useConfirm() {
  const [options, setOptions] = useState<Options | null>(null);
  const resolveRef = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((opts: Options) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = useCallback((ok: boolean) => {
    setOptions(null);
    resolveRef.current?.(ok);
    resolveRef.current = null;
  }, []);

  const dialog = options ? <ConfirmDialog options={options} onClose={close} /> : null;
  return { confirm, dialog };
}

function ConfirmDialog({ options, onClose }: { options: Options; onClose: (ok: boolean) => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={() => onClose(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="font-display text-lg font-semibold text-slate-900">
          {options.title}
        </h2>
        {options.message && <p className="mt-1.5 text-sm text-slate-600">{options.message}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onClose(false)}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onClose(true)}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
          >
            {options.confirmLabel || "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
