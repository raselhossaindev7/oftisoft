import type { Metadata } from "next";
import { headers } from "next/headers";
import Navbar from "@/components/navbar";
import Footer from "@/components/sections/footer";
import LiveChatPopup from "@/components/live-chat-popup";
import { resolvePageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const pathname = h.get("x-pathname") || "/";
  return resolvePageMetadata(pathname);
}

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <div className="h-20 lg:h-24" aria-hidden="true" />
            {children}
            <Footer />
            <LiveChatPopup />
        </>
    );
}

