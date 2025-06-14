import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/TaskCard";
import { Task } from "@/lib/db";
import { FileText, Plus } from "lucide-react";
import EmptyTasksState from "./emptyStates/EmptyTasksState";
import { TasksListSection } from "./TasksListSelection";

interface TasksListProps {
  columns: string[];
  tasksByColumn: Record<string, Task[]>;
  activeTimers: Record<string, number>;
  totalTasks: number;
  onAddTask: (column?: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onTimerToggle: (task: Task) => void;
}

export const TasksList = ({
  columns,
  tasksByColumn,
  activeTimers,
  totalTasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onDuplicateTask,
  onTimerToggle,
}: TasksListProps) => {
  if (totalTasks === 0) {
    return <EmptyTasksState onAddTask={() => onAddTask()} />;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {columns.map((column) => {
            const tasks = tasksByColumn[column] || [];
            if (tasks.length === 0) return null;

            return (
              <TasksListSection
                key={column}
                column={column}
                tasks={tasks}
                activeTimers={activeTimers}
                onAddTask={() => onAddTask(column)}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onCompleteTask={onCompleteTask}
                onDuplicateTask={onDuplicateTask}
                onTimerToggle={onTimerToggle}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
