import { useEffect, useState } from "react";
import { useScroll, useTransform, MotionValue } from "framer-motion";
import { useMediaQuery } from "../../hooks/use-media-query";

// Hook to respect user's reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is defined (for server-side rendering)
    if (typeof window === "undefined") {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const onChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  return prefersReducedMotion;
}

// Hook for scroll-linked animations
export function useScrollAnimation(
  scrollYProgress: MotionValue<number>,
  inputRange: number[],
  outputRange: (number | string)[]
) {
  return useTransform(scrollYProgress, inputRange, outputRange);
}

// Hook for scroll-triggered animations
export function useInViewAnimation() {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref || prefersReducedMotion || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);
    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, prefersReducedMotion]);

  return { ref: setRef, isInView, prefersReducedMotion };
}

// Hook for responsive animations
export function useResponsiveAnimation() {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  return { isMobile, isTablet, isDesktop };
}
