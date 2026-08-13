"use client";

import { useEffect, useRef } from "react";
import type { FormState } from "@/app/admin/actions";

// Navigate when a server action asks for it via `next`. A full-page
// window.location navigation (not router.push) on purpose: Next's own
// handling of redirect() inside server actions performs a server-side fetch
// of the target through the public origin, which this host's containers
// cannot reach — see FormState in app/admin/actions.ts. A hard navigation
// also re-reads cookies and server state from scratch, which is exactly what
// the auth flow wants.
export function useActionNav(state: FormState) {
  const navigated = useRef(false);

  useEffect(() => {
    if (state.next && !navigated.current) {
      navigated.current = true;
      window.location.replace(state.next);
    }
  }, [state]);
}
