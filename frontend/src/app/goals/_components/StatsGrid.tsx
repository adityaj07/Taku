"use client";

import { isToday } from "date-fns";
import { StreakCard } from "./StreakCard";
import { WeeklyGoalCard } from "./WeeklyGoalCard";
import { MonthlyTaskCard } from "./MonthlyTaskCard";
import { HeatmapDay } from "../page";

interface StatsGridProps {
  streakData: { current: number; longest: number };
  weeklyProgress: { current: number; goal: number; percentage: number };
  monthlyTaskProgress: { current: number; goal: number; percentage: number };
  heatmapData: HeatmapDay[];
  onWeeklyGoalUpdate: (newGoal: number) => Promise<void>;
  onMonthlyGoalUpdate: (newGoal: number) => void;
}

export const StatsGrid = ({
  streakData,
  weeklyProgress,
  monthlyTaskProgress,
  heatmapData,
  onWeeklyGoalUpdate,
  onMonthlyGoalUpdate,
}: StatsGridProps) => {
  // Check if streak is at risk
  const todayActivity = heatmapData.find((d) => isToday(d.date));
  const streakAtRisk =
    streakData.current > 0 && (!todayActivity || todayActivity.value === 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StreakCard
        current={streakData.current}
        longest={streakData.longest}
        streakAtRisk={streakAtRisk}
      />
      <WeeklyGoalCard
        current={weeklyProgress.current}
        goal={weeklyProgress.goal}
        percentage={weeklyProgress.percentage}
        onGoalUpdate={onWeeklyGoalUpdate}
      />
      <MonthlyTaskCard
        current={monthlyTaskProgress.current}
        goal={monthlyTaskProgress.goal}
        percentage={monthlyTaskProgress.percentage}
        onGoalUpdate={onMonthlyGoalUpdate}
      />
    </div>
  );
};
