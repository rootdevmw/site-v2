"use client";
import { useEffect } from "react";
import { safeJourney, type JourneyName } from "@/lib/utils/public-journeys";
export function PublicJourneyEvents() {
  useEffect(() => {
    function record(event: Event) {
      const detail = safeJourney((event as CustomEvent).detail);
      if (detail)
        window.dispatchEvent(new CustomEvent("church:analytics", { detail }));
    }
    function click(event: MouseEvent) {
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (!link) return;
      let name: JourneyName | undefined;
      const action = link.dataset.journey;
      if (action === "broadcast_provider_open" || action === "publication_open")
        name = action;
      else {
        const url = new URL(link.href, window.location.origin);
        if (url.origin === window.location.origin) {
          if (url.pathname === "/plan-visit") name = "visit_open";
          else if (url.pathname.startsWith("/content/")) name = "message_open";
        } else if (
          url.hostname === "www.google.com" &&
          url.pathname.startsWith("/maps")
        )
          name = "directions_open";
        else if (url.hostname === "wa.me") name = "group_enquiry";
      }
      if (name)
        window.dispatchEvent(
          new CustomEvent("church:journey", {
            detail: { event: name, path: window.location.pathname },
          }),
        );
    }
    window.addEventListener("church:journey", record);
    document.addEventListener("click", click);
    return () => {
      window.removeEventListener("church:journey", record);
      document.removeEventListener("click", click);
    };
  }, []);
  return null;
}
