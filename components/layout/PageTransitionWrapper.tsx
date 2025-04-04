"use client";

import { motion, AnimatePresence } from "framer-motion";
import { pageTransition } from "@/lib/animations/variants"; // Adjust path if necessary
import { useReducedMotion } from "@/lib/animations/hooks"; // Adjust path if necessary
import { usePathname } from "next/navigation";

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

export function PageTransitionWrapper({
  children,
}: PageTransitionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname(); // Use pathname as key for route changes

  // Skip animation if user prefers reduced motion or if it's the initial load
  if (prefersReducedMotion) {
    return (
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // Animate when pathname changes
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8" // Apply container styles here
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
