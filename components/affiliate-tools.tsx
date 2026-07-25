"use client";

import { useState, useEffect } from "react";
import { ExternalLink, TrendingUp, MousePointerClick, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface AffiliateLink {
  id: string;
  name: string;
  description: string;
  programName: string;
  url: string;
  imageUrl?: string;
  badgeText?: string;
  commissionRate: number;
  category: string;
}

export default function AffiliateTools({ category, title }: { category?: string; title?: string }) {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = category ? `/affiliate-links/category/${category}` : "/affiliate-links/active";
    api.get(endpoint)
      .then((res) => setLinks(res.data))
      .catch(() => setLinks([]))
      .finally(() => setLoading(false));
  }, [category]);

  const trackClick = async (id: string, url: string) => {
    try { await api.post(`/affiliate-links/${id}/click`); } catch {}
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) return <div className="grid md:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-muted/20 animate-pulse" />)}</div>;
  if (links.length === 0) return null;

  return (
    <div className="space-y-6">
      {title && <h3 className="text-2xl font-bold text-white">{title}</h3>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <Card key={link.id} className="group border-white/5 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-500 rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">{link.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{link.programName}</p>
                </div>
                {link.badgeText && (
                  <Badge variant="outline" className="shrink-0 ml-2 text-micro px-2 border-primary/20 text-primary">{link.badgeText}</Badge>
                )}
              </div>
              {link.description && <p className="text-xs text-muted-foreground/80 leading-relaxed mb-4 line-clamp-2">{link.description}</p>}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-micro text-muted-foreground">
                  {link.commissionRate > 0 && <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-400" />{link.commissionRate}%</span>}
                </div>
                <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => trackClick(link.id, link.url)}>
                  Learn More <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-micro text-center text-muted-foreground/40">We may earn a commission when you purchase through these links. <a href="/privacy" className="underline">Affiliate disclosure</a></p>
    </div>
  );
}
