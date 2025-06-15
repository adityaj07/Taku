import { Workspace } from "@/lib/db";
import { cn } from "@/lib/utils";
import { addDays, format, isSameDay, isToday, startOfWeek } from "date-fns";
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
  // Calculate daily progress (assuming 8-hour goal)
  const getDailyProgress = (date: Date) => {
    if (!currentWorkspace) return 0;
    const dayEntries = currentWorkspace.timeEntries.filter((entry) =>
      isSameDay(new Date(entry.startTime), date)
    );
    const totalMinutes = dayEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );
    const dailyGoalMinutes = 8 * 60; // 8 hours
    return Math.min((totalMinutes / dailyGoalMinutes) * 100, 100);
  };

  // Get week dates starting from Monday
  const getWeekDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDates = getWeekDates();

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);
            const progress = getDailyProgress(date);

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "relative p-3 rounded-lg transition-all duration-200 group",
                  isSelected
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
                  isCurrentDay &&
                    !isSelected &&
                    "ring-2 ring-orange-300 dark:ring-orange-600"
                )}
              >
                <div className="text-center space-y-1">
                  <div className="font-dosis text-xs font-medium opacity-75">
                    {format(date, "EEE").toUpperCase()}
                  </div>
                  <div className="font-dosis text-lg font-bold">
                    {format(date, "d")}
                  </div>

                  {/* Progress Ring */}
                  <div className="relative w-6 h-6 mx-auto">
                    <svg
                      className="w-6 h-6 transform -rotate-90"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="opacity-20"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke={isSelected ? "white" : "rgb(249 115 22)"}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 9}`}
                        strokeDashoffset={
                          2 * Math.PI * 9 * (1 - progress / 100)
                        }
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold">
                        {Math.round(progress)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyStrip;
