"use client";

import { Button } from "@/components/ui/button";
import { Task, TimeEntry } from "@/lib/db";
import { cn } from "@/lib/utils";
import { getPriorityColor, getPriorityIcon } from "@/utils";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Trash2,
  User,
} from "lucide-react";
import { FC } from "react";

interface TimeEntryCardProps {
  entry: TimeEntry & { task?: Task };
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatTime: (timeString: string) => string;
  formatDuration: (minutes: number) => string;
  getColumnColor: (column: string) => string;
}

const TimeEntryCard: FC<TimeEntryCardProps> = ({
  entry,
  isExpanded,
  onToggleExpansion,
  onEdit,
  onDelete,
  formatTime,
  formatDuration,
  getColumnColor,
}) => {
  return (
    <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              {entry.task ? (
                <div className="flex items-center gap-2">
                  <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                    {entry.task.title}
                  </h4>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-md text-xs border font-medium",
                      getColumnColor(entry.task.column)
                    )}
                  >
                    {entry.task.column}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-md text-xs border font-medium flex items-center gap-1",
                      getPriorityColor(entry.task.priority)
                    )}
                  >
                    {getPriorityIcon(entry.task.priority)}
                    {entry.task.priority}
                  </span>
                  {entry.task.dueDate && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(entry.task.dueDate), "MMM dd")}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                    Manual Entry
                  </h4>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(entry.startTime)} -{" "}
                {entry.endTime ? formatTime(entry.endTime) : "ongoing"}
              </span>
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 rounded font-dosis font-medium">
                {formatDuration(entry.duration)}
              </span>
            </div>

            {entry.description && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: isExpanded ? 1 : 0,
                    height: isExpanded ? "auto" : 0,
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="font-dosis text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {entry.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {entry.description && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpansion}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeEntryCard;
