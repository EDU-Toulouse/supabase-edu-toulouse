"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  slideInBottom,
  staggerContainer,
  listItemVariants,
} from "../../lib/animations/variants"; // Use relative paths
import { useReducedMotion } from "../../lib/animations/hooks"; // Use relative paths
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const prefersReducedMotion = useReducedMotion();
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="bg-stone-950 text-zinc-400 py-12 w-full mt-12" // Adjusted background and text color
      variants={!prefersReducedMotion ? slideInBottom : undefined}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Column 1: EDU-Toulouse */}
          <motion.div variants={listItemVariants}>
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              EDU-Toulouse
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-primary w-12 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.5, originX: 0 }}
                viewport={{ once: true }}
              />
            </h3>
            <p className="leading-relaxed text-sm">
              Esport & Digital Universe Toulouse - Your platform for esports
              events and digital entertainment in Toulouse.
            </p>

            <div className="flex space-x-4 mt-6">
              <SocialLink
                href="https://github.com"
                icon={<Github size={18} />}
                label="GitHub"
              />
              <SocialLink
                href="https://twitter.com"
                icon={<Twitter size={18} />}
                label="Twitter"
              />
              <SocialLink
                href="https://linkedin.com"
                icon={<Linkedin size={18} />}
                label="LinkedIn"
              />
              <SocialLink
                href="mailto:contact@edu-toulouse.com"
                icon={<Mail size={18} />}
                label="Email"
              />
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={listItemVariants}>
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              Quick Links
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-primary w-12 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.5, originX: 0 }}
                viewport={{ once: true }}
              />
            </h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/events">Events</FooterLink>
              <FooterLink href="/teams">Teams</FooterLink>
              <FooterLink href="/profile">Profile</FooterLink>
              <FooterLink href="/">Home</FooterLink> {/* Added Home Link */}
            </ul>
          </motion.div>

          {/* Column 3: Legal & Connect */}
          <motion.div variants={listItemVariants}>
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              Connect & Legal
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-primary w-12 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.5, originX: 0 }}
                viewport={{ once: true }}
              />
            </h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="https://discord.gg" external>
                Discord Community
              </FooterLink>
              <FooterLink href="mailto:contact@edu-toulouse.com">
                Contact Us
              </FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12 pt-8 border-t border-stone-700/50 text-center text-xs" // Adjusted border color and text size
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p>&copy; {currentYear} EDU-Toulouse. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
}

// Reusable FooterLink component
function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const MotionLinkComponent = external ? motion.a : motion(Link);
  const linkProps = external
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };

  return (
    <motion.li
      whileHover={{ x: 5 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <MotionLinkComponent
        {...linkProps}
        className="hover:text-white transition-colors duration-200 block"
      >
        {children}
      </MotionLinkComponent>
    </motion.li>
  );
}

// Reusable SocialLink component
function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -3, color: "#fff" }}
      whileTap={{ scale: 0.95 }}
      className="hover:text-white transition"
      aria-label={label}
    >
      {icon}
    </motion.a>
  );
}
