import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TasksListHeaderProps {
  column: string;
  taskCount: number;
  onAddTask: () => void;
}

const TasksListHeader = ({
  column,
  taskCount,
  onAddTask,
}: TasksListHeaderProps) => {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <h2 className="font-dosis text-lg font-semibold text-gray-900 dark:text-gray-100">
        {column}
      </h2>
      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
        {taskCount}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddTask}
        className="font-dosis text-xs h-8"
      >
        <Plus className="w-3 h-3 mr-1" />
        Add Task
      </Button>
    </div>
  );
};

export default TasksListHeader;
