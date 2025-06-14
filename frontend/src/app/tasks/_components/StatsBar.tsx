import { cn } from "@/lib/utils";
import { formatTime } from "@/utils";
import { CheckCircle2, Clock, Kanban, List, Target } from "lucide-react";
import { Dispatch, FC, SetStateAction } from "react";

interface StatsBarProps {
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  totalTimeSpent: number;
  viewMode: "kanban" | "list";
  setViewMode: Dispatch<SetStateAction<"kanban" | "list">>;
}

const StatsBar: FC<StatsBarProps> = ({
  completedTasks,
  inProgressTasks,
  totalTasks,
  totalTimeSpent,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                <Target className="w-3 h-3 text-white" />
              </div>
              <div>
                <span className="font-dosis text-xs text-blue-600 dark:text-blue-400">
                  Total
                </span>
                <span className="font-dosis text-sm font-bold text-blue-900 dark:text-blue-100 ml-2">
                  {totalTasks}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <div>
                <span className="font-dosis text-xs text-orange-600 dark:text-orange-400">
                  In Progress
                </span>
                <span className="font-dosis text-sm font-bold text-orange-900 dark:text-orange-100 ml-2">
                  {inProgressTasks}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
              <div>
                <span className="font-dosis text-xs text-green-600 dark:text-green-400">
                  Completed
                </span>
                <span className="font-dosis text-sm font-bold text-green-900 dark:text-green-100 ml-2">
                  {completedTasks}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <div>
                <span className="font-dosis text-xs text-purple-600 dark:text-purple-400">
                  Time Spent
                </span>
                <span className="font-dosis text-sm font-bold text-purple-900 dark:text-purple-100 ml-2">
                  {formatTime(totalTimeSpent)}
                </span>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                viewMode === "kanban"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <Kanban className="w-4 h-4" />
              <span className="font-dosis">Board</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                viewMode === "list"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <List className="w-4 h-4" />
              <span className="font-dosis">List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
