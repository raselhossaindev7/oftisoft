"use client";

import { useQuery } from "@tanstack/react-query";
import { marketingAPI, portfolioAPI } from "@/lib/api";
import type { PricingPlan } from "@/lib/store/pricing-content";
import type { Product as ShopProduct, Bundle as ShopBundle } from "@/lib/store/shop-content";
import type { ProjectItem } from "@/lib/store/portfolio-content";

export function usePublicSubscriptionPlans(interval?: string) {
    return useQuery({
        queryKey: ["public", "subscription-plans", interval],
        queryFn: () => marketingAPI.getSubscriptionPlans(interval),
        staleTime: 1000 * 60 * 5,
    });
}

export function usePublicProducts() {
    return useQuery({
        queryKey: ["public", "products"],
        queryFn: () => marketingAPI.getProducts(),
        staleTime: 1000 * 60 * 5,
    });
}

export function usePublicBundles() {
    return useQuery({
        queryKey: ["public", "bundles"],
        queryFn: () => marketingAPI.getBundles(),
        staleTime: 1000 * 60 * 5,
    });
}

/** Map backend SubscriptionPlan to PricingPlan for pricing page */
export function mapSubscriptionPlansToPricing(plans: any[]): PricingPlan[] {
    if (!Array.isArray(plans) || plans.length === 0) return [];
    return plans
        .filter((p) => p && p.isActive !== false)
        .map((p, idx) => ({
            id: p.id ?? `plan-${idx}`,
            name: p.name ?? "Plan",
            description: p.description ?? "",
            price: String(p.price ?? 0),
            period: p.interval === "year" ? "Year" : "Month",
            features: Array.isArray(p.features) && p.features.length ? p.features : ["Included in subscription"],
            buttonText: p.buttonText ?? "Get started",
            popular: idx === 1 || (p.activeSubscribers > 0),
            order: idx + 1,
        }));
}

/** Map backend Product to shop Product shape */
export function mapApiProductsToShop(products: any[]): ShopProduct[] {
    if (!Array.isArray(products) || products.length === 0) return [];
    return products.map((p) => ({
        id: p.id,
        name: p.name ?? "",
        slug: p.slug ?? p.id,
        description: p.description ?? "",
        price: Number(p.price) ?? 0,
        rating: Number(p.rating) ?? 0,
        reviews: Number(p.reviews) ?? 0,
        category: p.category ?? "",
        subcategory: p.subcategory ?? "",
        image: p.image ?? "",
        tags: Array.isArray(p.tags) ? p.tags : [],
        features: Array.isArray(p.features) ? p.features : [],
        screenshots: Array.isArray(p.screenshots) ? p.screenshots : [],
        demoUrl: p.demoUrl ?? "",
        docUrl: p.docUrl ?? "",
        compatibility: Array.isArray(p.compatibility) ? p.compatibility : [],
        version: p.version ?? "",
        updatePolicy: p.updatePolicy ?? "",
        licenseRegular: Number(p.licenseRegular) ?? 0,
        licenseExtended: Number(p.licenseExtended) ?? 0,
        lastUpdated: p.lastUpdated ? new Date(p.lastUpdated).toISOString().slice(0, 10) : "",
        faqs: Array.isArray(p.faqs) ? p.faqs : [],
        type: p.type ?? 'digital',
        downloadUrl: p.downloadUrl ?? undefined,
    }));
}

export function usePublicPortfolio() {
    return useQuery({
        queryKey: ["public", "portfolio"],
        queryFn: () => portfolioAPI.getPublished(),
        staleTime: 1000 * 60 * 5,
    });
}

/** Map backend Portfolio item to frontend ProjectItem */
export function mapApiPortfolioToProject(item: any): ProjectItem {
    let parsedStats: { label: string; value: string }[] = [];
    if (typeof item.stats === "string") {
        try { parsedStats = JSON.parse(item.stats); } catch { parsedStats = []; }
    } else if (Array.isArray(item.stats)) {
        parsedStats = item.stats;
    }

    return {
        id: item.id,
        slug: item.slug ?? item.id,
        title: item.title ?? "",
        category: item.category ?? "",
        image: item.image ?? null,
        tags: Array.isArray(item.tags) ? item.tags : [],
        description: item.description ?? "",
        longDescription: item.longDescription ?? "",
        client: item.client ?? "",
        url: item.demoUrl ?? "",
        github: "",
        stats: parsedStats,
        gradient: item.gradient ?? "from-primary/20 to-primary/10",
    };
}

/** Map backend Portfolio array to frontend ProjectItem array */
export function mapApiPortfolioToProjects(items: any[]): ProjectItem[] {
    if (!Array.isArray(items) || items.length === 0) return [];
    return items.map(mapApiPortfolioToProject);
}

export function useProductReviews(productId: string) {
    return useQuery({
        queryKey: ["public", "product-reviews", productId],
        queryFn: async () => {
            const { reviewsAPI } = await import("@/lib/api");
            return reviewsAPI.getByProduct(productId);
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 2,
    });
}

/** Map backend Bundle (with products relation) to shop Bundle shape */
export function mapApiBundlesToShop(bundles: any[]): ShopBundle[] {
    if (!Array.isArray(bundles) || bundles.length === 0) return [];
    return bundles.map((b) => {
        const productIds = Array.isArray(b.products)
            ? b.products.map((p: any) => (typeof p === "string" ? p : p?.id)).filter(Boolean)
            : [];
        const originalPrice = Number(b.originalPrice) ?? Number(b.price);
        const price = Number(b.price) ?? 0;
        const savings = Math.max(0, originalPrice - price);
        return {
            id: b.id,
            name: b.name ?? "",
            description: b.description ?? "",
            products: productIds,
            price,
            originalPrice,
            savings,
            image: b.image ?? "",
            tags: Array.isArray(b.tags) ? b.tags : [],
            status: b.isActive !== false ? "active" : "inactive",
        };
    });
}