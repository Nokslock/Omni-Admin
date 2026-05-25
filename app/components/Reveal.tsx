"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "span";
  className?: string;
  y?: number;
  fadeOut?: boolean;
};

export function Reveal({
  children,
  delay = 0,
  as = "div",
  className = "",
  y = 28,
  fadeOut = true,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, y });

      // Entrance — plays once per enter into the start zone
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        delay: delay / 1000,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });

      // Exit when scrolled past the bottom of the element
      if (fadeOut) {
        gsap.to(el, {
          opacity: 0,
          y: -y * 0.5,
          duration: 0.6,
          ease: "power2.in",
          scrollTrigger: {
            trigger: el,
            start: "bottom 8%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, [delay, y, fadeOut]);

  const Tag = as as keyof React.JSX.IntrinsicElements;

  return (
    // @ts-expect-error generic ref over polymorphic element
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
