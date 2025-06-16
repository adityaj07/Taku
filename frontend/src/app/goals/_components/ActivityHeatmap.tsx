"use client";

import { FC } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { getActivityColor } from "@/utils";
import { HeatmapDay } from "../page";

interface ActivityHeatmapProps {
  heatmapData: HeatmapDay[];
}

const ActivityHeatmap: FC<ActivityHeatmapProps> = ({ heatmapData }) => {
  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="font-dosis">Activity Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="grid grid-cols-53 gap-1 min-w-[800px]">
                {heatmapData.map((day, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <motion.div
                        className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-orange-300 dark:hover:ring-orange-600 ${getActivityColor(
                          day.value
                        )}`}
                        whileHover={{ scale: 1.2 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center space-y-1">
                        <p className="font-dosis font-semibold">
                          {format(day.date, "MMM dd, yyyy")}
                        </p>
                        <p className="font-dosis text-sm">
                          {Math.floor(day.timeTracked / 60)}h{" "}
                          {day.timeTracked % 60}m tracked
                        </p>
                        <p className="font-dosis text-sm">
                          {day.tasksCompleted} tasks completed
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-dosis text-gray-600 dark:text-gray-400">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`w-3 h-3 rounded-sm ${getActivityColor(
                        level
                      )}`}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityHeatmap;
