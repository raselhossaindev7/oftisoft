"use client";

import { useRef, useEffect, useMemo, useState, type ReactNode, type HTMLAttributes } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const isNum = (v: any): v is number => typeof v === "number" && !isNaN(v);

type AnimProps = {
  initial?: Record<string, any> | false;
  animate?: Record<string, any>;
  whileInView?: Record<string, any>;
  whileHover?: Record<string, any>;
  whileTap?: Record<string, any>;
  viewport?: { once?: boolean; amount?: number; margin?: string };
  transition?: Record<string, any>;
  layoutId?: string;
  layout?: boolean | string;
  exit?: Record<string, any>;
  variants?: Record<string, any>;
  onViewportEnter?: () => void;
  onViewportLeave?: () => void;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  className?: string;
  children?: ReactNode;
  as?: React.ElementType;
} & HTMLAttributes<HTMLElement>;

const MOTION_PROPS = new Set([
  "layoutId", "whileFocus", "whileDrag",
  "whileTap", "exit", "variants", "layout", "positionTransition",
  "onAnimationStart", "onAnimationComplete",
  "onViewportEnter", "onViewportLeave",
]);

function toGsapEase(ease?: string): string {
  if (!ease) return "power2.out";
  if (ease === "spring" || ease === "spring.soft") return "back.out(1.7)";
  if (ease.startsWith("spring")) return "back.out(1.7)";
  return ease;
}

function toGsapTransition(t: Record<string, any> = {}): gsap.TweenVars {
  const vars: gsap.TweenVars = {};
  if (isNum(t.duration)) vars.duration = t.duration;
  if (isNum(t.delay)) vars.delay = t.delay;
  if (t.ease) vars.ease = toGsapEase(t.ease);
  if (t.repeat === Infinity || t.repeat === -1) {
    vars.repeat = -1;
    vars.yoyo = true;
  }
  return vars;
}

export function Animated({
  as = "div",
  initial: _initial,
  animate,
  whileInView,
  whileHover,
  viewport,
  transition,
  className = "",
  style: extStyle,
  children,
  ...rest
}: AnimProps) {
  const Tag = as;
  const ref = useRef<HTMLElement>(null);
  const animRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const hoverEnterRef = useRef<gsap.core.Tween | null>(null);
  const hoverLeaveRef = useRef<gsap.core.Tween | null>(null);

  const hasMount = animate != null;
  const hasScroll = whileInView != null;
  const noInit = _initial === false;

  const fromState = useMemo(() => {
    if (hasMount) {
      return (_initial && typeof _initial === "object") ? { ..._initial } : {};
    }
    if (hasScroll) {
      if (_initial && typeof _initial === "object") return { ..._initial };
      const f: Record<string, any> = {};
      if (whileInView && isNum(whileInView.opacity)) f.opacity = 0;
      if (whileInView && isNum(whileInView.y)) f.y = -(whileInView.y as number) || 24;
      if (whileInView && isNum(whileInView.x)) f.x = -(whileInView.x as number) || 24;
      if (whileInView && isNum(whileInView.scale)) f.scale = (whileInView.scale as number) * 0.9;
      return f;
    }
    return {};
  }, [hasMount, hasScroll, _initial, whileInView]);

  const shouldHide = (hasScroll || hasMount) && !noInit && Object.keys(fromState).length > 0;

  const initialStyle = useMemo(() => {
    if (!shouldHide) return undefined;
    const s: Record<string, string> = {};
    const parts: string[] = [];
    if (isNum(fromState.opacity)) s.opacity = String(fromState.opacity);
    if (isNum(fromState.y)) parts.push(`translateY(${fromState.y}px)`);
    if (isNum(fromState.x)) parts.push(`translateX(${fromState.x}px)`);
    if (isNum(fromState.scale)) parts.push(`scale(${fromState.scale})`);
    if (parts.length) s.transform = parts.join(" ");
    return s as React.CSSProperties;
  }, [shouldHide, fromState]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      if (hasScroll && !hasMount) {
        const toVars: gsap.TweenVars = {};
        if (whileInView && isNum(whileInView.opacity)) toVars.opacity = whileInView.opacity;
        if (whileInView && isNum(whileInView.y)) toVars.y = whileInView.y;
        if (whileInView && isNum(whileInView.x)) toVars.x = whileInView.x;
        if (whileInView && isNum(whileInView.scale)) toVars.scale = whileInView.scale;

        const fromVars: gsap.TweenVars = {};
        if (isNum(fromState.opacity)) fromVars.opacity = fromState.opacity;
        if (isNum(fromState.y)) fromVars.y = fromState.y;
        if (isNum(fromState.x)) fromVars.x = fromState.x;
        if (isNum(fromState.scale)) fromVars.scale = fromState.scale;

        const margin = parseInt(String((viewport as any)?.margin)) || 0;
        const triggerStart = margin < 0
          ? `top bottom-=${Math.abs(margin)}px`
          : margin > 0
            ? `top bottom+=${margin}px`
            : "top 85%";

        gsap.fromTo(el, fromVars, {
          ...toVars,
          ...toGsapTransition(transition),
          scrollTrigger: {
            trigger: el,
            start: triggerStart,
            toggleActions: viewport?.once !== false ? "play none none none" : "play reverse play reverse",
          },
        });
      }

      if (hasMount) {
        const to: gsap.TweenVars = {};
        if (animate && isNum(animate.opacity)) to.opacity = animate.opacity;
        if (animate && isNum(animate.y)) to.y = animate.y;
        if (animate && isNum(animate.x)) to.x = animate.x;
        if (animate && isNum(animate.scale)) to.scale = animate.scale;
        if (animate && isNum(animate.rotate)) to.rotate = animate.rotate;

        if (Array.isArray(animate?.scale) && animate.scale.length === 3) {
          to.scale = animate.scale[1];
          animRef.current = gsap.to(el, { ...to, ...toGsapTransition(transition) });
        } else if (Object.keys(fromState).length > 0 || Object.keys(to).length > 0) {
          const gsapFrom: gsap.TweenVars = {};
          if (isNum(fromState.y)) gsapFrom.y = fromState.y;
          if (isNum(fromState.x)) gsapFrom.x = fromState.x;
          if (isNum(fromState.opacity)) gsapFrom.opacity = fromState.opacity;
          if (isNum(fromState.scale)) gsapFrom.scale = fromState.scale;
          if (isNum(fromState.rotate)) gsapFrom.rotate = fromState.rotate;
          animRef.current = gsap.fromTo(el, gsapFrom, { ...to, ...toGsapTransition(transition) });
        }
      }

      if (whileHover) {
        const hoverVars: gsap.TweenVars = {};
        if (isNum(whileHover.scale)) hoverVars.scale = whileHover.scale;
        if (isNum(whileHover.y)) hoverVars.y = whileHover.y;
        if (isNum(whileHover.x)) hoverVars.x = whileHover.x;
        if (isNum(whileHover.opacity)) hoverVars.opacity = whileHover.opacity;

        const dur = transition?.duration ?? 0.2;
        const ease = toGsapEase(transition?.ease ?? "power2.out");

        el.addEventListener("mouseenter", () => {
          hoverLeaveRef.current?.kill();
          hoverEnterRef.current = gsap.to(el, { ...hoverVars, duration: dur, ease, overwrite: "auto" });
        });
        el.addEventListener("mouseleave", () => {
          hoverEnterRef.current?.kill();
          const returnVars: gsap.TweenVars = {};
          if (isNum(fromState.y)) returnVars.y = fromState.y;
          if (isNum(fromState.x)) returnVars.x = fromState.x;
          if (isNum(fromState.scale)) returnVars.scale = fromState.scale;
          hoverLeaveRef.current = gsap.to(el, { ...returnVars, duration: dur, ease, overwrite: "auto" });
        });
      }
    }, el);

    return () => {
      ctx.revert();
      animRef.current = null;
      hoverEnterRef.current = null;
      hoverLeaveRef.current = null;
    };
  }, [hasMount, hasScroll, noInit, !!whileHover]);

  const combinedStyle = (initialStyle || extStyle)
    ? { ...(initialStyle || {}), ...extStyle } as React.CSSProperties
    : undefined;

  const domProps = Object.fromEntries(
    Object.entries(rest).filter(([k]) => !MOTION_PROPS.has(k))
  );

  return (
    <Tag
      ref={ref as any}
      className={className}
      style={combinedStyle}
      {...(domProps as any)}
    >
      {children}
    </Tag>
  );
}

type AnimatePresenceProps = {
  children: ReactNode;
  mode?: "wait" | "popLayout" | "sync";
  custom?: any;
  initial?: boolean;
  onExitComplete?: () => void;
};

export function AnimatePresence({ children }: AnimatePresenceProps) {
  return <>{children}</>;
}

export const AnimatedDiv = (props: Omit<AnimProps, "as">) => <Animated as="div" {...props} />;
export const AnimatedSpan = (props: Omit<AnimProps, "as">) => <Animated as="span" {...props} />;
export const AnimatedH1 = (props: Omit<AnimProps, "as">) => <Animated as="h1" {...props} />;
export const AnimatedH2 = (props: Omit<AnimProps, "as">) => <Animated as="h2" {...props} />;
export const AnimatedH3 = (props: Omit<AnimProps, "as">) => <Animated as="h3" {...props} />;
export const AnimatedP = (props: Omit<AnimProps, "as">) => <Animated as="p" {...props} />;
export const AnimatedSection = (props: Omit<AnimProps, "as">) => <Animated as="section" {...props} />;
export const AnimatedAside = (props: Omit<AnimProps, "as">) => <Animated as="aside" {...props} />;

export function SlideUp({ children, delay = 0, duration = 0.35, className = "", ...rest }: { children: ReactNode; delay?: number; duration?: number; className?: string; [key: string]: any }) {
  return (
    <Animated initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration, delay }} className={className} {...rest}>
      {children}
    </Animated>
  );
}

export function FadeIn({ children, delay = 0, duration = 0.3, className = "", ...rest }: { children: ReactNode; delay?: number; duration?: number; className?: string; [key: string]: any }) {
  return (
    <Animated initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration, delay }} className={className} {...rest}>
      {children}
    </Animated>
  );
}

export function ScaleIn({ children, delay = 0, duration = 0.3, className = "", ...rest }: { children: ReactNode; delay?: number; duration?: number; className?: string; [key: string]: any }) {
  return (
    <Animated initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration, delay }} className={className} {...rest}>
      {children}
    </Animated>
  );
}

export function Reveal({ children, className = "", delay = 0, duration = 0.4, once = true, ...rest }: { children: ReactNode; delay?: number; duration?: number; once?: boolean; className?: string; [key: string]: any }) {
  return (
    <Animated whileInView={{ opacity: 1, y: 0 }} viewport={{ once }} transition={{ duration, delay }} className={className} {...rest}>
      {children}
    </Animated>
  );
}

export function useInView(options?: IntersectionObserverInit & { once?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { once = true, ...observerOptions } = options || {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && once) observer.unobserve(el);
      },
      { threshold: 0.1, ...observerOptions }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return { ref };
}

export function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafRef.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return scrollY;
}

export function useScrollProgress(ref?: React.RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        if (ref?.current) {
          const rect = ref.current.getBoundingClientRect();
          const wh = window.innerHeight;
          setProgress(Math.max(0, Math.min(1, (wh - rect.top) / (wh + rect.height))));
        } else {
          const doc = document.documentElement;
          const total = doc.scrollHeight - window.innerHeight;
          setProgress(total > 0 ? window.scrollY / total : 0);
        }
        rafRef.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [ref]);

  return progress;
}

export function useScrollOffset(ref: React.RefObject<HTMLElement | null>) {
  return useScrollProgress(ref);
}

export function useTransform(value: number, input: readonly number[], output: readonly number[]): number;
export function useTransform(value: number, input: readonly number[], output: readonly (number | string)[]): number | string;
export function useTransform(value: number, input: readonly number[], output: readonly (number | string)[]): number | string {
  return useMemo(() => {
    if (input.length <= 1) return output[0] ?? 0;
    const clamped = Math.max(input[0], Math.min(input[input.length - 1], value));
    for (let i = 0; i < input.length - 1; i++) {
      if (clamped >= input[i] && clamped <= input[i + 1]) {
        const t = (clamped - input[i]) / (input[i + 1] - input[i] || 1);
        const a = output[i];
        const b = output[i + 1];
        if (typeof a === "string" || typeof b === "string") {
          return t < 0.5 ? String(a) : String(b);
        }
        return (a as number) + t * ((b as number) - (a as number));
      }
    }
    return output[output.length - 1] ?? 0;
  }, [value, ...input, ...output]);
}

export function useSpring(value: number, config?: { stiffness?: number; damping?: number; restDelta?: number; mass?: number; velocity?: number }): number {
  const [smoothed, setSmoothed] = useState(value);
  const valRef = useRef(value);
  const smoothRef = useRef(value);
  valRef.current = value;
  const stiffness = config?.stiffness ?? 100;
  const damping = config?.damping ?? 20;

  useEffect(() => {
    let frame: number;
    const animate = () => {
      const diff = valRef.current - smoothRef.current;
      if (Math.abs(diff) < 0.001) {
        smoothRef.current = valRef.current;
        setSmoothed(valRef.current);
        return;
      }
      smoothRef.current += diff * (stiffness / 100) * (1 / (1 + damping / 20));
      setSmoothed(smoothRef.current);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [stiffness, damping]);

  return smoothed;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function useMotionValue(initial: number) {
  const ref = useRef(initial);
  const [state, setState] = useState(initial);
  return {
    get: () => ref.current,
    set: (v: number) => { ref.current = v; setState(v); },
  };
}

export function useParallax(elRef: React.RefObject<HTMLElement | null>, factor = 0.5) {
  const scrollY = useScrollY();
  const [offset, setOffset] = useState(0);
  const rectRef = useRef({ top: 0 });

  useEffect(() => {
    if (elRef.current) {
      rectRef.current = elRef.current.getBoundingClientRect();
    }
  }, [elRef]);

  useEffect(() => {
    setOffset((rectRef.current.top - scrollY) * factor);
  }, [scrollY, factor]);

  return offset;
}
