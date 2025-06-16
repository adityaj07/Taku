"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakCardProps {
  current: number;
  longest: number;
  streakAtRisk: boolean;
}

export const StreakCard = ({
  current,
  longest,
  streakAtRisk,
}: StreakCardProps) => {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/50 rounded-lg flex items-center justify-center">
              <motion.div
                animate={
                  streakAtRisk
                    ? { scale: [1, 1.1, 1] }
                    : { rotate: [0, 5, -5, 5, 0] }
                }
                transition={{
                  duration: streakAtRisk ? 1 : 2,
                  repeat: Infinity,
                  repeatDelay: streakAtRisk ? 0 : 3,
                }}
              >
                <Flame
                  className={`w-5 h-5 ${
                    streakAtRisk
                      ? "text-red-500"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                />
              </motion.div>
            </div>
            <div>
              <h3 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                Current Streak
              </h3>
              <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                Days in a row
              </p>
            </div>
          </div>
          {streakAtRisk && (
            <span className="text-xs font-dosis font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30 px-2 py-1 rounded-full">
              At Risk
            </span>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-dosis text-gray-900 dark:text-gray-100">
              {current}
            </span>
            <span className="font-dosis text-gray-600 dark:text-gray-400">
              {current === 1 ? "day" : "days"}
            </span>
          </div>
          {longest > current && (
            <p className="font-dosis text-sm text-gray-500 dark:text-gray-500">
              Best: {longest} days
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
