"use client";

import { motion } from "framer-motion";

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function LandingHeader() {
  return (
    <div className="space-y-6">
      {/* App name */}
      <motion.div variants={textVariants} className="space-y-2">
        <h1 className="font-main text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 dark:from-orange-400 dark:via-amber-400 dark:to-orange-500 bg-clip-text text-transparent">
          Taku
        </h1>
        <motion.div
          className="h-1 w-24 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
        />
      </motion.div>

      {/* Headlines */}
      <motion.div variants={textVariants} className="space-y-4">
        <h2 className="font-main text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-800 dark:text-gray-100">
          Track your time.{" "}
          <span className="text-orange-600 dark:text-orange-400">
            Build your focus.
          </span>
        </h2>

        <p className="font-main text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          A local-first time tracker that feels native. Keep your data yours
          while building better productivity habits.
        </p>
      </motion.div>
    </div>
  );
}
