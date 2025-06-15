"use client";

import { Target } from "lucide-react";
import { FC } from "react";

interface WeeklyStats {
  total: number;
  average: number;
  progress: number;
}

interface WeeklySummaryProps {
  weeklyStats: WeeklyStats;
  weeklyGoal: number;
  formatDuration: (minutes: number) => string;
}

const WeeklySummary: FC<WeeklySummaryProps> = ({
  weeklyStats,
  weeklyGoal,
  formatDuration,
}) => {
  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-dosis text-lg font-semibold text-gray-900 dark:text-gray-100">
              Weekly Summary
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
              <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                Total Tracked
              </span>
              <span className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                {formatDuration(weeklyStats.total)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
              <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                Daily Average
              </span>
              <span className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                {formatDuration(Number(weeklyStats.average.toFixed(2)))}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                  Weekly Goal
                </span>
                <span className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(weeklyStats.progress)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-1000"
                  style={{ width: `${weeklyStats.progress}%` }}
                />
              </div>
              <p className="font-dosis text-xs text-gray-500 dark:text-gray-400 mt-2">
                {formatDuration(weeklyStats.total)} of {weeklyGoal}h goal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;
