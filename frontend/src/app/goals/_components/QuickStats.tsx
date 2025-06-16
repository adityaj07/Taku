"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { HeatmapDay } from "../page";

interface QuickStatsProps {
  heatmapData: HeatmapDay[];
  monthlyTasksCount: number;
}

export const QuickStats = ({
  heatmapData,
  monthlyTasksCount,
}: QuickStatsProps) => {
  const getMostProductiveDay = () => {
    const maxDay = heatmapData.reduce(
      (max, day) => (day.timeTracked > max.timeTracked ? day : max),
      heatmapData[0] || { date: new Date(), timeTracked: 0 }
    );
    return format(maxDay.date, "MMM dd");
  };

  const getAverageDailyFocus = () => {
    const totalMinutes = heatmapData.reduce(
      (sum, day) => sum + day.timeTracked,
      0
    );
    const activeDays = heatmapData.filter((day) => day.timeTracked > 0).length;
    const avgMinutes = activeDays > 0 ? totalMinutes / activeDays : 0;
    return `${Math.floor(avgMinutes / 60)}h ${Math.floor(avgMinutes % 60)}m`;
  };

  const getActiveDaysCount = () => {
    return heatmapData.filter((day) => day.value > 0).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span className="font-dosis">Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
              Most productive day
            </span>
            <span className="font-dosis font-medium text-gray-900 dark:text-gray-100">
              {getMostProductiveDay()}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
              Average daily focus
            </span>
            <span className="font-dosis font-medium text-gray-900 dark:text-gray-100">
              {getAverageDailyFocus()}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
              Tasks this month
            </span>
            <span className="font-dosis font-medium text-gray-900 dark:text-gray-100">
              {monthlyTasksCount}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
              Active days this year
            </span>
            <span className="font-dosis font-medium text-gray-900 dark:text-gray-100">
              {getActiveDaysCount()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
