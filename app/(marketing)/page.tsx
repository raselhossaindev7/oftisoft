"use client";
import dynamic from "next/dynamic";
import Hero from "@/components/sections/hero";
import Services from "@/components/sections/services";
import FeaturedProjects from "@/components/sections/featured-projects";
import WhyUs from "@/components/sections/why-us";

const ProcessTimeline = dynamic(() => import("@/components/sections/process-timeline"), { ssr: true });
const Testimonials = dynamic(() => import("@/components/sections/testimonials"), { ssr: true });
const TechStack = dynamic(() => import("@/components/sections/tech-stack"), { ssr: true });
const LatestBlog = dynamic(() => import("@/components/sections/latest-blog"), { ssr: true });
const CTA = dynamic(() => import("@/components/sections/cta"), { ssr: true });

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col text-foreground overflow-hidden selection:bg-primary/30">
      <div className="fixed inset-0 z-[-1] pointer-events-none">
          <div className="absolute inset-0 bg-[#030014]" />
          <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] bg-purple-900/20 rounded-full blur-[80px] mix-blend-screen opacity-50 animate-blob transform-gpu will-change-transform" />
          <div className="absolute bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] bg-indigo-900/20 rounded-full blur-[80px] mix-blend-screen opacity-50 animate-blob transform-gpu will-change-transform" style={{ animationDelay: "2s" }} />
          <div className="absolute top-[40%] left-[30%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[60px] mix-blend-screen opacity-40 animate-blob transform-gpu will-change-transform" style={{ animationDelay: "4s" }} />
          <div className="absolute inset-0 opacity-[0.03] bg-grain pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030014_100%)] opacity-80" />
      </div>
      <Hero />
      <Services />
      <FeaturedProjects />
      <WhyUs />
      <ProcessTimeline />
      <Testimonials />
      <TechStack />
      <LatestBlog />
      <CTA />
    </div>
  );
}

