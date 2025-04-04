"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  pageTransition,
  staggerContainer,
  fadeIn,
  slideInLeft,
  slideInRight,
  cardVariants,
} from "@/lib/animations/variants"; // Reverted to alias path
import { useReducedMotion } from "@/lib/animations/hooks"; // Reverted to alias path
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper"; // Reverted to alias path
import { ArrowRight, Calendar, Users, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Scroll animations for Hero section
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(
    heroScrollProgress,
    [0, 0.5, 1],
    [1, 1, 0.3]
  );

  const heroScale = useTransform(
    heroScrollProgress,
    [0, 1],
    [1, 0.95] // Reduced scale for subtlety
  );

  const heroY = useTransform(
    heroScrollProgress,
    [0, 1],
    [0, 50] // Reduced Y translation
  );

  // Helper function to return animation props or undefined if reduced motion is preferred
  const getAnimationProps = (
    variants: any,
    initial = "hidden",
    animate = "visible",
    whileHover?: string,
    whileTap?: string
  ) => {
    if (prefersReducedMotion) return undefined;
    return {
      variants,
      initial,
      animate,
      ...(whileHover && { whileHover }),
      ...(whileTap && { whileTap }),
    };
  };

  const getScrollAnimationProps = (
    variants: any,
    initial = "hidden",
    whileInView = "visible",
    delay = 0
  ) => {
    if (prefersReducedMotion) return undefined;
    return {
      variants,
      initial,
      whileInView,
      viewport: { once: true, amount: 0.2 },
      transition: { delay },
    };
  };

  const getStaggerProps = (
    delay = 0.1,
    viewportOnce = true,
    viewportAmount = 0.1
  ) => {
    if (prefersReducedMotion) return undefined;
    return {
      variants: staggerContainer,
      initial: "hidden",
      whileInView: "visible",
      viewport: { once: viewportOnce, amount: viewportAmount },
      transition: { delayChildren: delay },
    };
  };

  return (
    <PageTransitionWrapper>
      <div className="flex flex-col -mt-16">
        {" "}
        {/* Offset the fixed header */}
        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          className="relative bg-gradient-to-b from-background via-background to-transparent text-foreground pt-32 pb-16 md:pt-40 md:pb-24 w-full overflow-hidden" // Adjusted padding
          style={
            !prefersReducedMotion
              ? { opacity: heroOpacity, y: heroY }
              : undefined
          }
        >
          <motion.div
            className="absolute inset-0 z-[-1] bg-[url('/images/esports-bg.jpg')] bg-cover bg-center opacity-10 dark:opacity-5"
            style={!prefersReducedMotion ? { scale: heroScale } : undefined}
          />
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
            <motion.div
              className="max-w-3xl"
              {...getStaggerProps(0.1, true, 0.1)}
            >
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
                {...getAnimationProps(slideInLeft)}
              >
                Esport & Digital Universe Toulouse
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl mb-8 text-muted-foreground"
                {...getAnimationProps(slideInRight)}
              >
                Join the community of gamers and digital enthusiasts in
                Toulouse. Participate in tournaments, connect with teams, and
                unleash your competitive spirit.
              </motion.p>
              <motion.div
                className="flex flex-wrap gap-4"
                {...getAnimationProps(fadeIn)}
              >
                <motion.div
                  whileHover={
                    !prefersReducedMotion ? { scale: 1.05 } : undefined
                  }
                  whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
                >
                  <Button asChild size="lg" className="group">
                    <Link href="/events" className="flex items-center">
                      Explore Events
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={
                    !prefersReducedMotion ? { scale: 1.05 } : undefined
                  }
                  whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
                >
                  <Button asChild variant="outline" size="lg">
                    <Link href="/teams">Find Teams</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
        {/* Features Section */}
        <motion.section
          ref={featuresRef}
          className="py-24 bg-background w-full"
          {...getStaggerProps(0.1, true, 0.2)}
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              {...getAnimationProps(fadeIn)}
            >
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-4"
                {...getScrollAnimationProps(fadeIn, "hidden", "visible", 0.2)}
              >
                Why Join EDU-Toulouse?
              </motion.h2>
              <motion.div
                className="h-1 w-20 bg-primary mx-auto rounded-full"
                initial={prefersReducedMotion ? undefined : { scaleX: 0 }}
                whileInView={prefersReducedMotion ? undefined : { scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, originX: 0.5 }}
                viewport={{ once: true }}
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Calendar className="h-8 w-8 text-primary" />} // Use primary color
                title="Esports Tournaments"
                description="Compete in various game tournaments ranging from team-based competitions to solo challenges."
                delay={0.1}
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-primary" />} // Use primary color
                title="Team Building"
                description="Create or join teams, coordinate with teammates, and develop your skills together."
                delay={0.3}
              />
              <FeatureCard
                icon={<Award className="h-8 w-8 text-primary" />} // Use primary color
                title="Community Events"
                description="Join workshops, seminars, and networking events designed for digital enthusiasts and gamers."
                delay={0.5}
              />
            </div>
          </div>
        </motion.section>
        {/* Call to Action */}
        <motion.section
          ref={ctaRef}
          className="py-24 bg-muted/50 w-full"
          {...getScrollAnimationProps(fadeIn)}
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              {...getScrollAnimationProps(fadeIn, "hidden", "visible", 0)}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Join the Community?
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto text-muted-foreground">
                Connect with your Discord account to participate in events, join
                teams, and become a part of the EDU-Toulouse community.
              </p>
              <motion.div
                whileHover={!prefersReducedMotion ? { scale: 1.05 } : undefined}
                whileTap={!prefersReducedMotion ? { scale: 0.95 } : undefined}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-lg"
                >
                  <Link href="/auth" className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    Login with Discord
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </PageTransitionWrapper>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  const cardAnimationProps = !prefersReducedMotion
    ? {
        variants: cardVariants,
        initial: "hidden",
        whileInView: "visible",
        whileHover: "hover",
        whileTap: "tap",
        viewport: { once: true, amount: 0.2 },
        transition: { delay },
      }
    : {};

  const iconAnimationProps = !prefersReducedMotion
    ? {
        initial: { scale: 0.5, opacity: 0 },
        whileInView: { scale: 1, opacity: 1 },
        transition: { delay: delay + 0.2, type: "spring" },
        viewport: { once: true },
      }
    : {};

  return (
    <motion.div {...cardAnimationProps} className="h-full">
      <Card className="h-full overflow-hidden bg-card hover:bg-card/90 transition-colors">
        <CardHeader>
          <motion.div
            className="mb-4 inline-block p-3 bg-primary/10 rounded-lg"
            {...iconAnimationProps}
          >
            {icon}
          </motion.div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
