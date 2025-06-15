import { Workspace } from "@/lib/db";
import { cn } from "@/lib/utils";
import { addDays, format, isSameDay, isToday, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";
import { Dispatch, FC, SetStateAction } from "react";

interface WeeklyStripProps {
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  currentWorkspace: Workspace;
}

const WeeklyStrip: FC<WeeklyStripProps> = ({
  selectedDate,
  currentWorkspace,
  setSelectedDate,
}) => {
  // Calculate daily goal in minutes (weekly goal divided by 7)
  const dailyGoalMinutes = Math.floor((currentWorkspace.weeklyGoals * 60) / 7);

  // Format duration helper
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Calculate daily progress and tracked time
  const getDailyStats = (date: Date) => {
    if (!currentWorkspace) return { trackedMinutes: 0, progress: 0 };

    const dayEntries = currentWorkspace.timeEntries.filter((entry) =>
      isSameDay(new Date(entry.startTime), date)
    );

    const trackedMinutes = dayEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );

    const progress = Math.min((trackedMinutes / dailyGoalMinutes) * 100, 100);

    return { trackedMinutes, progress };
  };

  // Get week dates starting from Monday
  const getWeekDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  // Navigate to previous/next week
  const navigateWeek = (direction: "prev" | "next") => {
    const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const newDate = addDays(currentWeekStart, direction === "next" ? 7 : -7);
    setSelectedDate(newDate);
  };

  const weekDates = getWeekDates();
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Week Navigation Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Target className="w-4 h-4" />
              <span className="font-dosis">
                Daily Goal: {formatDuration(dailyGoalMinutes)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateWeek("prev")}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <span className="font-dosis text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[140px] text-center">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </span>

            <button
              onClick={() => navigateWeek("next")}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              const { trackedMinutes, progress } = getDailyStats(date);
              const isGoalMet = trackedMinutes >= dailyGoalMinutes;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "relative p-4 rounded-xl transition-all duration-200 group border-2",
                    isSelected
                      ? "bg-orange-500 text-white border-orange-500 shadow-lg scale-105"
                      : isCurrentDay
                      ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-gray-900 dark:text-gray-100 hover:bg-orange-100 dark:hover:bg-orange-950/50"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <div className="text-center space-y-2">
                    {/* Day Name */}
                    <div
                      className={cn(
                        "font-dosis text-xs font-medium",
                        isSelected
                          ? "text-white/80"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {format(date, "EEE").toUpperCase()}
                    </div>

                    {/* Day Number */}
                    <div className="font-dosis text-xl font-bold">
                      {format(date, "d")}
                    </div>

                    {/* Goal Progress Visual */}
                    <div className="space-y-1">
                      {/* Progress Bar */}
                      <div
                        className={cn(
                          "h-1.5 rounded-full overflow-hidden",
                          isSelected
                            ? "bg-white/20"
                            : "bg-gray-200 dark:bg-gray-600"
                        )}
                      >
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            isGoalMet
                              ? isSelected
                                ? "bg-white"
                                : "bg-green-500"
                              : isSelected
                              ? "bg-white"
                              : "bg-orange-500"
                          )}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>

                      {/* Time Information */}
                      <div className="space-y-0.5">
                        <div
                          className={cn(
                            "font-dosis text-xs font-semibold",
                            isSelected
                              ? "text-white"
                              : isGoalMet
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-900 dark:text-gray-200"
                          )}
                        >
                          {formatDuration(trackedMinutes)}
                        </div>
                        <div
                          className={cn(
                            "font-dosis text-[10px]",
                            isSelected
                              ? "text-white/70"
                              : "text-gray-500 dark:text-gray-400"
                          )}
                        >
                          of {formatDuration(dailyGoalMinutes)}
                        </div>
                      </div>

                      {/* Goal Achievement Indicator */}
                      {isGoalMet && (
                        <div
                          className={cn(
                            "flex items-center justify-center mt-1",
                            isSelected
                              ? "text-white"
                              : "text-green-600 dark:text-green-400"
                          )}
                        >
                          <Target className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Tooltip Effect */}
                  <div
                    className={cn(
                      "absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-dosis px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10",
                      isSelected && "hidden"
                    )}
                  >
                    {Math.round(progress)}% complete
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyStrip;
