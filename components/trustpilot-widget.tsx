"use client";

import { useEffect } from "react";
import { Star } from "lucide-react";
import { trustpilotConfig } from "@/lib/trustpilot";

const BOOTSTRAP_SRC = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";

interface TrustpilotWidgetProps {
  theme?: "light" | "dark";
  height?: string;
  className?: string;
}

export default function TrustpilotWidget({
  theme = "dark",
  height = "52px",
  className = "",
}: TrustpilotWidgetProps) {
  useEffect(() => {
    if (!trustpilotConfig.businessUnitId) return;

    const widgetEl = document.getElementById("trustbox-review-collector");
    const existing = document.querySelector(`script[src="${BOOTSTRAP_SRC}"]`);

    if (existing) {
      const tp = (window as unknown as { Trustpilot?: { loadFromElement: (el: HTMLElement | null) => void } }).Trustpilot;
      tp?.loadFromElement(widgetEl);
      return;
    }

    const script = document.createElement("script");
    script.src = BOOTSTRAP_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (!trustpilotConfig.businessUnitId) {
    return (
      <a
        href={trustpilotConfig.reviewUrl}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-md transition-all hover:border-emerald-400/40 hover:bg-white/10 ${className}`}
      >
        <span className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-emerald-400 fill-current" />
          ))}
        </span>
        <span className="text-sm font-semibold text-white">Trustpilot</span>
        <span className="text-sm text-muted-foreground">Write a review</span>
      </a>
    );
  }

  return (
    <div
      id="trustbox-review-collector"
      className={`trustpilot-widget ${className}`}
      data-locale={trustpilotConfig.locale}
      data-template-id={trustpilotConfig.templateReviewCollectorId}
      data-businessunit-id={trustpilotConfig.businessUnitId}
      data-style-height={height}
      data-style-width="100%"
      data-theme={theme}
    >
      <a href={trustpilotConfig.reviewUrl} target="_blank" rel="noreferrer">
        Trustpilot
      </a>
    </div>
  );
}
