"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/lib/db";
import { cn } from "@/lib/utils";
import {
  formatActiveTime,
  formatTime,
  getPriorityColor,
  getPriorityIcon,
} from "@/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  Clock,
  Copy,
  Edit3,
  MoreHorizontal,
  Play,
  Square,
  Trash2,
} from "lucide-react";
import { forwardRef } from "react";
import TaskActions from "./TaskActions";

interface TaskCardProps {
  task: Task;
  activeTimer?: number;
  variant?: "kanban" | "list";
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
  onTimerToggle: (task: Task) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
  style?: React.CSSProperties;
  className?: string;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  (
    {
      task,
      activeTimer = 0,
      variant = "kanban",
      onEdit,
      onDelete,
      onComplete,
      onDuplicate,
      onTimerToggle,
      isDragging = false,
      dragHandleProps,
      style,
      className,
    },
    ref
  ) => {
    if (variant === "list") {
      return (
        <div
          ref={ref}
          style={style}
          className={cn(
            "group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all duration-200",
            className
          )}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Title */}
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-dosis font-medium text-gray-900 dark:text-gray-100 flex-1">
                    {task.title}
                  </h3>

                  {/* Priority Badge */}
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      getPriorityColor(task.priority)
                    )}
                  >
                    {getPriorityIcon(task.priority)}
                    <span className="capitalize">{task.priority}</span>
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="font-dosis text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {/* Due Date */}
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span className="font-dosis">
                        Due {format(new Date(task.dueDate), "MMM dd")}
                      </span>
                    </div>
                  )}

                  {/* Time Spent */}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-dosis font-mono">
                      {formatTime(task.timeSpent)}
                    </span>
                    {task.isActive && (
                      <span className="font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded text-xs animate-pulse">
                        {formatActiveTime(activeTimer)}
                      </span>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-1">
                    <span className="font-dosis">
                      Created {format(new Date(task.createdAt), "MMM dd")}
                    </span>
                  </div>
                </div>
              </div>

              {/* List Actions */}
              <TaskActions
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onComplete={onComplete}
                onDuplicate={onDuplicate}
                onTimerToggle={onTimerToggle}
                variant="list"
              />
            </div>
          </div>
        </div>
      );
    }

    // Kanban variant
    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm group transition-all duration-200 cursor-grab active:cursor-grabbing",
          isDragging
            ? "shadow-2xl rotate-1 scale-105 ring-2 ring-orange-200 dark:ring-orange-800 z-50"
            : "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600",
          task.isActive &&
            "ring-2 ring-orange-200 dark:ring-orange-800 bg-orange-50/50 dark:bg-orange-950/20",
          className
        )}
      >
        <div className="p-4 space-y-3">
          {/* Title and Actions Row */}
          <div
            className="flex items-start justify-between gap-2"
            {...dragHandleProps}
          >
            <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100 text-sm leading-relaxed flex-1">
              {task.title}
            </h4>

            {/* Kanban Actions */}
            <TaskActions
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
              onDuplicate={onDuplicate}
              onTimerToggle={onTimerToggle}
              variant="kanban"
            />
          </div>

          {/* Description */}
          {task.description && (
            <p className="font-dosis text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Priority and Due Date */}
          <div className="flex items-center justify-between gap-2">
            {/* Priority */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-gray-50 dark:bg-gray-700/50",
                getPriorityColor(task.priority)
              )}
            >
              {getPriorityIcon(task.priority)}
              <span className="capitalize font-medium">{task.priority}</span>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                <CalendarIcon className="w-3 h-3" />
                {format(new Date(task.dueDate), "MMM dd")}
              </div>
            )}
          </div>

          {/* Timer Section */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">
                {formatTime(task.timeSpent)}
              </span>
              {task.isActive && (
                <span className="text-xs font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded animate-pulse">
                  {formatActiveTime(activeTimer)}
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onTimerToggle(task);
              }}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                task.isActive
                  ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
              )}
            >
              {task.isActive ? (
                <Square className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);
