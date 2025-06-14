import { cn } from "@/lib/utils";
import { Square } from "lucide-react";

// Separate component for empty state to keep things clean
interface EmptyColumnStateProps {
  column: string;
  isDraggingOver: boolean;
  onAddTask: () => void;
}

const EmptyColumnState = ({
  column,
  isDraggingOver,
  onAddTask,
}: EmptyColumnStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-64 text-center transition-all duration-200",
        isDraggingOver ? "text-orange-600" : "text-gray-500"
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-200",
          isDraggingOver
            ? "bg-orange-100 dark:bg-orange-950/30"
            : "bg-gray-100 dark:bg-gray-800"
        )}
      >
        <Square
          className={cn(
            "w-8 h-8 transition-all duration-200",
            isDraggingOver ? "text-orange-600" : "text-gray-400"
          )}
        />
      </div>
      <p className="font-dosis dark:text-gray-400 mb-2">
        {isDraggingOver
          ? `Drop task in ${column.toLowerCase()}`
          : `No tasks in ${column.toLowerCase()}`}
      </p>
      {!isDraggingOver && (
        <button
          onClick={onAddTask}
          className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
        >
          Add your first task
        </button>
      )}
    </div>
  );
};

export default EmptyColumnState;
