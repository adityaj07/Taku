"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const mascotVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 80,
      damping: 15,
    },
  },
};

const floatingVariants = {
  floating: {
    y: [0, -12, 0],
    rotate: [0, 1, 0, -1, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const waveVariants = {
  wave: {
    rotate: [0, 20, -10, 20, -5, 15, 0],
    scale: [1, 1.1, 1, 1.05, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
      repeatDelay: 4,
    },
  },
};

const blinkVariants = {
  blink: {
    scaleY: [1, 0.1, 1],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      repeatDelay: 3,
      ease: "easeInOut",
    },
  },
};

const cheekGlowVariants = {
  glow: {
    opacity: [0.6, 1, 0.6],
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const heartBeatVariants = {
  beat: {
    scale: [1, 1.2, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function TakuMascot() {
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount((prev) => prev + 1);
  };

  // Reset click count after a delay
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  return (
    <motion.div variants={mascotVariants} className="flex justify-center">
      <motion.div
        variants={floatingVariants}
        animate="floating"
        className="relative cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Mascot container */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52">
          {/* Enhanced glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-300 via-yellow-300 to-amber-300 rounded-full blur-lg opacity-40 dark:opacity-25"
            animate={
              isHovered
                ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.6, 0.4],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Main mascot body with enhanced gradients */}
          <div className="relative w-full h-full bg-gradient-to-br from-orange-300 via-orange-400 to-amber-500 rounded-full border-4 border-white dark:border-gray-600 shadow-2xl">
            {/* Body texture overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 rounded-full" />

            {/* Face area with better proportions */}
            <div className="absolute inset-3 bg-gradient-to-br from-orange-200 via-orange-300 to-amber-400 rounded-full shadow-inner">
              {/* Cheek blushes */}
              <motion.div
                variants={cheekGlowVariants}
                animate="glow"
                className="absolute top-1/3 left-2 w-4 h-3 sm:w-5 sm:h-4 lg:w-6 lg:h-5 bg-pink-300/60 rounded-full blur-sm"
              />
              <motion.div
                variants={cheekGlowVariants}
                animate="glow"
                className="absolute top-1/3 right-2 w-4 h-3 sm:w-5 sm:h-4 lg:w-6 lg:h-5 bg-pink-300/60 rounded-full blur-sm"
              />

              {/* Eyes with enhanced detail */}
              <motion.div
                variants={blinkVariants}
                animate="blink"
                className="absolute top-1/4 left-1/4 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gray-900 rounded-full shadow-sm"
              >
                {/* Eye highlights */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/60 rounded-full" />
              </motion.div>

              <motion.div
                variants={blinkVariants}
                animate="blink"
                className="absolute top-1/4 right-1/4 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gray-900 rounded-full shadow-sm"
              >
                {/* Eye highlights */}
                <div className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/60 rounded-full" />
              </motion.div>

              {/* Enhanced nose */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-2 sm:w-4 sm:h-3 lg:w-5 lg:h-4 bg-gradient-to-b from-pink-400 to-pink-500 rounded-full shadow-sm">
                <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-pink-300 rounded-full" />
              </div>

              {/* Enhanced mouth */}
              <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-5 h-3 sm:w-7 sm:h-4 lg:w-8 lg:h-5 border-b-3 border-gray-800 rounded-b-full opacity-80" />

              {/* Whiskers */}
              <div className="absolute top-1/2 left-0 w-6 h-0.5 bg-gray-600 rounded-full transform -translate-y-1/2 opacity-40" />
              <div className="absolute top-1/2 left-0 w-4 h-0.5 bg-gray-600 rounded-full transform  translate-y-2 opacity-30" />
              <div className="absolute top-1/2 right-0 w-6 h-0.5 bg-gray-600 rounded-full transform -translate-y-1/2 opacity-40" />
              <div className="absolute top-1/2 right-0 w-4 h-0.5 bg-gray-600 rounded-full transform  translate-y-2 opacity-30" />
            </div>

            {/* Enhanced ears with better positioning */}
            <div className="absolute -top-3 left-1/4 w-5 h-8 sm:w-6 sm:h-10 lg:w-7 lg:h-12 bg-gradient-to-br from-orange-300 to-amber-500 rounded-full transform -rotate-15 shadow-lg">
              <div className="absolute inset-1 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full" />
            </div>
            <div className="absolute -top-3 right-1/4 w-5 h-8 sm:w-6 sm:h-10 lg:w-7 lg:h-12 bg-gradient-to-br from-orange-300 to-amber-500 rounded-full transform rotate-15 shadow-lg">
              <div className="absolute inset-1 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full" />
            </div>
          </div>

          {/* Enhanced waving hand with arm */}
          <motion.div
            variants={waveVariants}
            animate="wave"
            className="absolute -right-4 top-1/3 origin-bottom-left"
          >
            {/* Arm */}
            <div className="w-3 h-8 sm:w-4 sm:h-10 lg:w-5 lg:h-12 bg-gradient-to-b from-orange-400 to-amber-500 rounded-full border-2 border-white dark:border-gray-600 shadow-lg" />

            {/* Hand */}
            <div className="absolute -top-1 -right-2 w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full border-2 border-white dark:border-gray-600 shadow-lg">
              {/* Fingers */}
              <div className="absolute top-1 left-1 w-1.5 h-4 sm:w-2 sm:h-5 bg-gradient-to-b from-orange-200 to-orange-300 rounded-full" />
              <div className="absolute top-0.5 left-3 w-1.5 h-4 sm:w-2 sm:h-5 bg-gradient-to-b from-orange-200 to-orange-300 rounded-full" />
              <div className="absolute top-1 right-1 w-1.5 h-3 sm:w-2 sm:h-4 bg-gradient-to-b from-orange-200 to-orange-300 rounded-full" />

              {/* Palm details */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-orange-200/50 rounded-full" />
            </div>
          </motion.div>

          {/* Enhanced floating particles */}
          <motion.div
            className="absolute -top-6 -right-6 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full shadow-lg"
            animate={{
              y: [0, -25, 0],
              x: [0, 10, 0],
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 0.5,
            }}
          />

          <motion.div
            className="absolute -bottom-4 -left-6 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-orange-300 to-orange-400 rounded-full shadow-lg"
            animate={{
              y: [0, -20, 0],
              x: [0, -8, 0],
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.4, 1],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: 1.5,
            }}
          />

          <motion.div
            className="absolute top-1/4 -left-8 w-2 h-2 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full shadow-lg"
            animate={{
              y: [0, -15, 0],
              x: [0, -5, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              delay: 2,
            }}
          />

          {/* Love hearts when clicked */}
          {clickCount > 0 && (
            <>
              {[...Array(Math.min(clickCount, 3))].map((_, i) => (
                <motion.div
                  key={`heart-${clickCount}-${i}`}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    y: [0, -40, -80],
                    x: [0, (i - 1) * 20, (i - 1) * 30],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                  }}
                >
                  <motion.div
                    variants={heartBeatVariants}
                    animate="beat"
                    className="w-4 h-4 text-pink-500"
                  >
                    ❤️
                  </motion.div>
                </motion.div>
              ))}
            </>
          )}

          {/* Sparkle effects when hovered */}
          {isHovered && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              ))}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
