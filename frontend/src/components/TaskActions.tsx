"use client";

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
  Check,
  Copy,
  Edit3,
  MoreHorizontal,
  Play,
  Square,
  Trash2,
} from "lucide-react";

interface TaskActionsProps {
  task: Task;
  variant: "kanban" | "list";
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
  onTimerToggle: (task: Task) => void;
}

const TaskActions = ({
  task,
  variant,
  onEdit,
  onDelete,
  onComplete,
  onDuplicate,
  onTimerToggle,
}: TaskActionsProps) => {
  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  if (variant === "list") {
    return (
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => handleClick(e, () => onEdit(task))}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/20"
          title="Edit task"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => handleClick(e, () => onComplete(task.id))}
          className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-md hover:bg-green-50 dark:hover:bg-green-950/20"
          title="Mark as complete"
        >
          <Check className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => handleClick(e, () => onTimerToggle(task))}
          className={cn(
            "p-2 rounded-md transition-colors",
            task.isActive
              ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
          )}
          title={task.isActive ? "Stop timer" : "Start timer"}
        >
          {task.isActive ? (
            <Square className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDuplicate(task)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(task)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Kanban actions
  return (
    <div
      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => handleClick(e, () => onEdit(task))}
        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
        title="Edit task"
      >
        <Edit3 className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => handleClick(e, () => onComplete(task.id))}
        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
        title="Mark as complete"
      >
        <Check className="w-4 h-4" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => handleClick(e, () => onDuplicate(task))}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => handleClick(e, () => onDelete(task))}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TaskActions;
