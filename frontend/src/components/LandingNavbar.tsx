"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Menu, Target, X } from "lucide-react";
import { Dosis } from "next/font/google";
import { useState } from "react";

const dosis = Dosis({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dosis",
});

interface LandingNavbarProps {
  onStartFresh: () => void;
  isLoading?: boolean;
}

export default function LandingNavbar({
  onStartFresh,
  isLoading,
}: LandingNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Benefits", href: "#benefits" },
    { label: "Privacy", href: "#privacy" },
  ];

  return (
    <>
      {/* Desktop Dock Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`${dosis.variable} fixed top-6 left-1/2 -translate-x-1/2 z-50 hidden lg:block`}
      >
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-gray-900/10 dark:shadow-gray-900/50">
          <div className="flex items-center gap-1 p-2">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 px-4 py-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="font-dosis text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                Taku
              </span>
            </motion.div>

            {/* Navigation Items */}
            <div className="flex items-center gap-1 mx-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => scrollToSection(item.href.slice(1))}
                  className="font-dosis text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/80 dark:hover:bg-orange-950/50 transition-all duration-200 font-medium px-4 py-2 rounded-xl"
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={onStartFresh}
                disabled={isLoading}
                className="font-dosis font-semibold px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl ml-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Get Started"
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`${dosis.variable} fixed top-0 left-0 right-0 z-50 lg:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Logo */}
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="font-dosis text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                Taku
              </span>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-all duration-200"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          y: isMobileMenuOpen ? 0 : -20,
          scale: isMobileMenuOpen ? 1 : 0.95,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`lg:hidden fixed top-16 left-4 right-4 z-40 ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl shadow-gray-900/10 dark:shadow-gray-900/50 p-6">
          <div className="space-y-4">
            {/* Navigation Items */}
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                onClick={() => scrollToSection(item.href.slice(1))}
                className="block w-full text-left font-dosis text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/80 dark:hover:bg-orange-950/50 transition-all duration-200 py-3 px-4 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                {item.label}
              </motion.button>
            ))}

            {/* Mobile CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 border-t border-gray-200/60 dark:border-gray-700/60"
            >
              <Button
                onClick={() => {
                  onStartFresh();
                  setIsMobileMenuOpen(false);
                }}
                disabled={isLoading}
                className="w-full font-dosis font-semibold py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl border-0 rounded-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Get Started Free"
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
