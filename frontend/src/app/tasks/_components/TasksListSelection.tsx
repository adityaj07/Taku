import { TaskCard } from "@/components/TaskCard";
import { Task } from "@/lib/db";
import TasksListHeader from "./TasksListHeader";

interface TasksListSectionProps {
  column: string;
  tasks: Task[];
  activeTimers: Record<string, number>;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onTimerToggle: (task: Task) => void;
}

export const TasksListSection = ({
  column,
  tasks,
  activeTimers,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onDuplicateTask,
  onTimerToggle,
}: TasksListSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Column Header */}
      <TasksListHeader
        column={column}
        taskCount={tasks.length}
        onAddTask={onAddTask}
      />

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            activeTimer={activeTimers[task.id]}
            variant="list"
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onComplete={onCompleteTask}
            onDuplicate={onDuplicateTask}
            onTimerToggle={onTimerToggle}
          />
        ))}
      </div>
    </div>
  );
};
