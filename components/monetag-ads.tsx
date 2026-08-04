"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const AD_PAGES = [
  "/blog",
  "/careers",
  "/about",
  "/community",
  "/docs",
  "/features",
  "/integrations",
  "/portfolio",
  "/changelog",
  "/status",
  "/support",
  "/tools",
  "/partners",
];

function shouldShowAd(pathname: string): boolean {
  return AD_PAGES.some(
    (page) => pathname === page || pathname.startsWith(page + "/")
  );
}

export default function MonetagAds() {
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldShowAd(pathname)) return;

    const existing = document.querySelector(
      'script[src="https://quge5.com/88/tag.min.js"]'
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src = "https://quge5.com/88/tag.min.js";
    script.setAttribute("data-zone", "263763");
    script.setAttribute("async", "");
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);
  }, [pathname]);

  return null;
}
