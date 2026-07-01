"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const prevPath = useRef<string | null>(null);

  // 1. Capture UTM params and referrer immediately on initial load or search params changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get("utm_source");
      const utmMedium = params.get("utm_medium");
      const utmCampaign = params.get("utm_campaign");
      const referrer = document.referrer;

      const stored = localStorage.getItem("marketing_attribution");
      let attributionObj = stored ? JSON.parse(stored) : {};

      if (utmSource || utmMedium || utmCampaign) {
        attributionObj = {
          utm_source: utmSource || attributionObj.utm_source || null,
          utm_medium: utmMedium || attributionObj.utm_medium || null,
          utm_campaign: utmCampaign || attributionObj.utm_campaign || null,
          referrer: referrer || attributionObj.referrer || null,
          logged: attributionObj.logged || false,
        };
        localStorage.setItem("marketing_attribution", JSON.stringify(attributionObj));
      } else if (referrer && !referrer.includes(window.location.host) && !attributionObj.referrer) {
        attributionObj = {
          utm_source: attributionObj.utm_source || null,
          utm_medium: attributionObj.utm_medium || null,
          utm_campaign: attributionObj.utm_campaign || null,
          referrer: referrer,
          logged: attributionObj.logged || false,
        };
        localStorage.setItem("marketing_attribution", JSON.stringify(attributionObj));
      }
    }
  }, [searchParams]);

  // 2. Track page views on route changes
  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (currentPath === prevPath.current) return;
    prevPath.current = currentPath;

    void (async () => {
      try {
        await fetch("/api/analytics/pageview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            referrer: typeof document !== "undefined" && document.referrer ? document.referrer : null,
          }),
        });
      } catch (err) {
        console.warn("[analytics] failed to log page view:", err);
      }
    })();
  }, [pathname, searchParams]);

  // 3. Sync attribution to DB once the user is authenticated
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const stored = localStorage.getItem("marketing_attribution");
      if (stored) {
        const attr = JSON.parse(stored);
        if (attr && !attr.logged && (attr.utm_source || attr.utm_medium || attr.utm_campaign || attr.referrer)) {
          void (async () => {
            try {
              const res = await fetch("/api/analytics/attribution", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  utm_source: attr.utm_source,
                  utm_medium: attr.utm_medium,
                  utm_campaign: attr.utm_campaign,
                  referrer: attr.referrer,
                }),
              });
              if (res.ok) {
                attr.logged = true;
                localStorage.setItem("marketing_attribution", JSON.stringify(attr));
              }
            } catch (err) {
              console.warn("[analytics] failed to log attribution:", err);
            }
          })();
        }
      }
    }
  }, [user]);

  return null;
}
