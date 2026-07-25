"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP, useTransform, useSpring } from "@/lib/animated";
import { TypeAnimation } from "react-type-animation";
import Link from "next/link";
import Image from "next/image";
import CountUp from "react-countup";
import { ArrowRight, Play, Code2, Cpu } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroStat {
  value: number;
  suffix: string;
  label: string;
}

interface HeroContent {
  badge?: string;
  title?: string;
  subtitles?: string[];
  subtitle?: string;
  description?: string;
  primaryCTA?: { text: string };
  secondaryCTA?: { text: string };
  stats?: HeroStat[];
  image?: string;
  imageUrl?: string;
}

const defaultHeroContent: HeroContent = {
  badge: "Trusted by 50+ Global Companies",
  title: "Engineering the Future of",
  subtitles: ["Digital Innovation.", "Web Architecture.", "AI Solutions.", "SaaS Platforms."],
  subtitle: "Digital Innovation.",
  description: "We architect high-performance applications that scale. From AI-powered platforms to enterprise software, Oftisoft delivers digital solutions that drive real business growth.",
  primaryCTA: { text: "Start Your Project" },
  secondaryCTA: { text: "View Our Work" },
  image: "/images/2.png",
  stats: [
    { value: 500, suffix: "+", label: "Projects Delivered" },
    { value: 6, suffix: "+", label: "Years Experience" },
    { value: 25, suffix: "+", label: "Expert Engineers" },
    { value: 15, suffix: "+", label: "Global Markets" },
  ],
};

interface HeroProps {
  data?: {
    hero?: HeroContent;
  };
}

export default function Hero({ data }: HeroProps) {
  const heroContent: HeroContent = data?.hero || defaultHeroContent;

  const containerRef = useRef<HTMLDivElement>(null);

  // SMOOTH MOUSE PARALLAX - Optimized with RAF throttling
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const rafId = useRef<number | null>(null);
  const pendingMouse = useRef({ x: 0, y: 0 });

  // Optimized mouse handler with RAF throttling (60fps max)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX - innerWidth / 2) / innerWidth;
    const y = (clientY - innerHeight / 2) / innerHeight;

    pendingMouse.current = { x, y };

    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        setMouseX(pendingMouse.current.x);
        setMouseY(pendingMouse.current.y);
        rafId.current = null;
      });
    }
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Very smooth spring physics
  const springConfig = { damping: 50, stiffness: 400, mass: 2 };
  const rotateX = useSpring(
    useTransform(mouseY, [-1, 1], [5, -5]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-1, 1], [-5, 5]),
    springConfig,
  );

  return (
    <section ref={containerRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-24 md:py-0 bg-transparent perspective-container"
      onMouseMove={handleMouseMove}
    >
      {/* Ambient Background Glows - Optimized with translate3d for GPU */}
      <div className="absolute top-[-10%] right-[-5%] w-[300px] sm:w-[400px] lg:w-[600px] h-[300px] sm:h-[400px] lg:h-[600px] bg-primary/20 rounded-full blur-[80px] lg:blur-[120px] mix-blend-screen opacity-20 pointer-events-none will-change-transform" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[250px] sm:w-[350px] lg:w-[500px] h-[250px] sm:h-[350px] lg:h-[500px] bg-secondary/10 rounded-full blur-[60px] lg:blur-[100px] mix-blend-screen opacity-20 pointer-events-none will-change-transform" />

      <div className="container relative z-10 px-3 sm:px-4 mx-auto">
        <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-8 xl:gap-12 items-center">
          {/* Left: Content */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8 mx-auto lg:mx-0 w-full">
            <AnimatedDiv initial={false}>
              <Link href="/contact">
                  <Badge variant="glass"
                    className="px-3 sm:px-5 py-1.5 sm:py-2.5 gap-1.5 sm:gap-2.5 rounded-full text-xs font-medium tracking-wide cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  {heroContent.badge}
                </Badge>
              </Link>
            </AnimatedDiv>

            <AnimatedH1 initial={false}
              style={{ willChange: "transform, opacity", fontSize: "clamp(36px, 5.5vw, 72px)" }}
              className="break-words font-bold leading-[1.05] tracking-[-0.04em] text-foreground"
            >
              <span className="block drop-shadow-sm">
                {heroContent.title ?? "Engineering the Future of"}
              </span>
              <SmoothTypewriter heroContent={heroContent} />
            </AnimatedH1>

            <AnimatedP initial={false}
              className="type-body-lg md:text-xl text-muted-foreground/80 font-light"
            >
              {heroContent.description ?? "We architect high-performance applications that scale."}
            </AnimatedP>

            <AnimatedDiv initial={false}
              className="flex flex-col sm:flex-row items-center gap-3 w-full"
            >
              <Button asChild size="xl"
                variant="premium"
                className="w-full sm:w-auto overflow-hidden group relative text-sm whitespace-nowrap"
              >
                <Link href="/contact">
                  <span className="relative z-20 flex items-center justify-center gap-2">
                    {heroContent.primaryCTA?.text ?? "Start Your Project"}
                    <ArrowRight className="w-4 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-secondary opacity-80 group-hover:opacity-100 transition-opacity duration-300 rounded-full pointer-events-none z-10" />
                </Link>
              </Button>

              <Button asChild size="xl"
                variant="outline"
                className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm rounded-full group text-sm whitespace-nowrap"
              >
                <Link href="/portfolio">
                  <Play className="w-4 h-4 fill-current mr-2 group-hover:scale-110 transition-transform shrink-0" />
                  {heroContent.secondaryCTA?.text ?? "View Our Work"}
                </Link>
              </Button>
            </AnimatedDiv>

            <AnimatedDiv initial={false}
              className="pt-6 sm:pt-10 w-full border-t border-white/5 mt-4 sm:mt-8 grid grid-cols-2 sm:flex sm:flex-wrap justify-center md:justify-between lg:justify-start gap-x-2 sm:gap-x-6 md:gap-x-8 xl:gap-x-12 gap-y-3 sm:gap-y-6"
            >
              {heroContent.stats?.map((stat: HeroStat, i: number) => (
                <div key={i}
                  className="relative group flex flex-col items-center lg:items-start min-w-[60px]"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-full">
                    <div className="flex items-baseline justify-center lg:justify-start gap-1">
                      <span className="font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
                        style={{ fontSize: "clamp(28px, 8vw, 48px)" }}
                      >
                        <CountUp end={stat.value}
                          duration={2.5}
                          enableScrollSpy scrollSpyOnce
                        />
                      </span>
                      <span className="text-primary font-semibold"
                        style={{ fontSize: "clamp(16px, 5vw, 30px)" }}
                      >
                        {stat.suffix}
                      </span>
                    </div>
                    <div className="h-0.5 w-4 sm:w-6 md:w-8 bg-primary/30 mt-1 mb-1.5 mx-auto lg:mx-0 group-hover:w-full transition-all duration-500" />
                    <p className="text-muted-foreground tracking-wide font-medium text-center lg:text-left leading-tight"
                      style={{ fontSize: "clamp(12px, 3.5vw, 25px)" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </AnimatedDiv>
          </div>

          {/* Right: Professional Showcase */}
          <div className="lg:col-span-2 relative hidden lg:flex min-h-[400px] xl:min-h-[600px] w-full items-center justify-center">
            <AnimatedDiv initial={false}
              className="relative w-full max-w-[400px] xl:max-w-[500px] flex items-center justify-center"
            >
              {/* Soft Ambient Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-secondary/10 blur-[120px]" />

              {/* Image Card */}
              <div className="relative z-10 w-full rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-[1px] shadow-2xl shadow-primary/10">
                <div className="relative w-full rounded-3xl bg-[#0a0a0a] overflow-hidden">
                  {heroContent.image || heroContent.imageUrl ? (
                    <>
                      <Image
                        src={heroContent.image || heroContent.imageUrl!}
                        alt={heroContent.title ?? ""}
                        width={500}
                        height={500}
                        className="w-full h-full object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600">
                      <span className="text-6xl font-bold text-white/60">O</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Badge - Top Right */}
              <div className="absolute -top-2 -right-2 z-20 px-4 py-2 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-white/90 tracking-wide">EST. 2019</span>
              </div>

              {/* Badge - Bottom Left */}
              <div className="absolute -bottom-2 -left-2 z-20 px-4 py-2 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-white/90">Enterprise Grade</span>
              </div>

              {/* Decorative Lines */}
              <div className="absolute top-[8%] right-[5%] w-8 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="absolute bottom-[8%] left-[5%] w-8 h-[1px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
            </AnimatedDiv>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .perspective-container {
          perspective: 2000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .will-change-transform {
          will-change: transform;
        }
      `}</style>
    </section>
  );
}

function SmoothTypewriter({ heroContent }: { heroContent: HeroContent }) {
  const defaultWords: [string, number][] = [
    "Digital Solutions.", 2000,
    "Web Architecture.", 2000,
    "AI Innovation.", 2000,
    "SaaS Platforms.", 2000,
  ] as unknown as [string, number][];

  const words = heroContent.subtitles?.length
    ? heroContent.subtitles.flatMap((w) => [w, 2000] as [string, number])
    : heroContent.subtitle
      ? [[heroContent.subtitle, 2000] as [string, number]]
      : defaultWords;

  return (
    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 h-[1.1em] inline-block min-w-[5em] sm:min-w-[8em] md:min-w-[12em]">
      <TypeAnimation
        sequence={words.flat() as (string | number)[]}
        wrapper="span"
        speed={40}
        repeat={Infinity}
        cursor={true}
        className="inline-block"
      />
    </span>
  );
}
