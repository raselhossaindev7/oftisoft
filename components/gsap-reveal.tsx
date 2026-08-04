"use client";

import { useRef, useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface GsapRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  stagger?: number;
  as?: "div" | "section" | "span" | "h1" | "h2" | "h3" | "p";
  id?: string;
}

export function GsapReveal({
  children,
  className = "",
  delay = 0,
  y = 40,
  duration = 0.6,
  stagger = 0,
  as: Tag = "div",
  id,
}: GsapRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger ? el.children : el;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, duration, stagger]);

  return (
    <Tag ref={ref as any} className={className} id={id} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}

export function GsapFade({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration,
          delay,
          ease: "power1.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [delay, duration]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

export function GsapStagger({
  children,
  className = "",
  delay = 0,
  stagger = 0.08,
  y = 30,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.children,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay,
          stagger,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [delay, stagger, y]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
