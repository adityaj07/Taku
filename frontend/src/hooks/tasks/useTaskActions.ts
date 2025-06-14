import { useCallback, useState } from "react";
import { useWorkspaceStore } from "@/store";
import { Task } from "@/lib/db";
import { toast } from "sonner";

type NewTaskData = {
  title: string;
  description?: string;
  column: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
};

type TaskUpdates = Partial<
  Pick<Task, "title" | "description" | "priority" | "dueDate">
>;

interface TaskActionsReturn {
  // Actions
  addTask: (taskData: NewTaskData) => Promise<void>;
  editTask: (taskId: string, updates: TaskUpdates) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  duplicateTask: (task: Task) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  toggleTimer: (task: Task) => Promise<void>;

  // Loading states
  isAdding: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  isDuplicating: boolean;
  isCompleting: boolean;
  isTogglingTimer: boolean;

  // General loading state
  isLoading: boolean;
}

export const useTaskActions = (): TaskActionsReturn => {
  // Get store actions
  const {
    addTask: storeAddTask,
    updateTask: storeUpdateTask,
    deleteTask: storeDeleteTask,
    moveTask: storeMoveTask,
    startTimer: storeStartTimer,
    stopTimer: storeStopTimer,
  } = useWorkspaceStore();

  // Loading states
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isTogglingTimer, setIsTogglingTimer] = useState(false);

  // Computed loading state
  const isLoading =
    isAdding ||
    isEditing ||
    isDeleting ||
    isDuplicating ||
    isCompleting ||
    isTogglingTimer;

  // Add Task Action
  const addTask = useCallback(
    async (taskData: NewTaskData) => {
      // Validation
      if (!taskData.title.trim()) {
        toast.error("Task title is required");
        return;
      }

      setIsAdding(true);
      try {
        await storeAddTask({
          title: taskData.title.trim(),
          description: taskData.description?.trim() || "",
          column: taskData.column,
          priority: taskData.priority,
          dueDate: taskData.dueDate || new Date().toISOString(),
        });

        toast.success("Task created successfully");
      } catch (error) {
        console.error("Failed to add task:", error);
        toast.error("Failed to create task. Please try again.");
        throw error; // Re-throw so calling component can handle it
      } finally {
        setIsAdding(false);
      }
    },
    [storeAddTask]
  );

  // Edit Task Action
  const editTask = useCallback(
    async (taskId: string, updates: TaskUpdates) => {
      // Validation
      if (updates.title !== undefined && !updates.title.trim()) {
        toast.error("Task title cannot be empty");
        return;
      }

      setIsEditing(true);
      try {
        // Clean up the updates object
        const cleanUpdates: Partial<Task> = {};

        if (updates.title !== undefined) {
          cleanUpdates.title = updates.title.trim();
        }
        if (updates.description !== undefined) {
          cleanUpdates.description = updates.description.trim();
        }
        if (updates.priority !== undefined) {
          cleanUpdates.priority = updates.priority;
        }
        if (updates.dueDate !== undefined) {
          cleanUpdates.dueDate = updates.dueDate;
        }

        await storeUpdateTask(taskId, cleanUpdates);
        toast.success("Task updated successfully");
      } catch (error) {
        console.error("Failed to edit task:", error);
        toast.error("Failed to update task. Please try again.");
        throw error;
      } finally {
        setIsEditing(false);
      }
    },
    [storeUpdateTask]
  );

  // Delete Task Action
  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!taskId) {
        toast.error("Invalid task ID");
        return;
      }

      setIsDeleting(true);
      try {
        await storeDeleteTask(taskId);
        toast.success("Task deleted successfully");
      } catch (error) {
        console.error("Failed to delete task:", error);
        toast.error("Failed to delete task. Please try again.");
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [storeDeleteTask]
  );

  // Duplicate Task Action
  const duplicateTask = useCallback(
    async (task: Task) => {
      if (!task) {
        toast.error("Invalid task data");
        return;
      }

      setIsDuplicating(true);
      try {
        await storeAddTask({
          title: `${task.title} (Copy)`,
          description: task.description || "",
          column: task.column,
          priority: task.priority,
          dueDate: task.dueDate,
        });

        toast.success("Task duplicated successfully");
      } catch (error) {
        console.error("Failed to duplicate task:", error);
        toast.error("Failed to duplicate task. Please try again.");
        throw error;
      } finally {
        setIsDuplicating(false);
      }
    },
    [storeAddTask]
  );

  // Complete Task Action
  const completeTask = useCallback(
    async (taskId: string) => {
      if (!taskId) {
        toast.error("Invalid task ID");
        return;
      }

      setIsCompleting(true);
      try {
        await storeMoveTask(taskId, "Done");
        toast.success("Task marked as complete");
      } catch (error) {
        console.error("Failed to complete task:", error);
        toast.error("Failed to mark task as complete. Please try again.");
        throw error;
      } finally {
        setIsCompleting(false);
      }
    },
    [storeMoveTask]
  );

  // Toggle Timer Action
  const toggleTimer = useCallback(
    async (task: Task) => {
      if (!task) {
        toast.error("Invalid task data");
        return;
      }

      setIsTogglingTimer(true);
      try {
        if (task.isActive) {
          await storeStopTimer(task.id);
          toast.success("Timer stopped");
        } else {
          await storeStartTimer(task.id);
          toast.success("Timer started");
        }
      } catch (error) {
        console.error("Failed to toggle timer:", error);
        toast.error("Failed to toggle timer. Please try again.");
        throw error;
      } finally {
        setIsTogglingTimer(false);
      }
    },
    [storeStartTimer, storeStopTimer]
  );

  return {
    // Actions
    addTask,
    editTask,
    deleteTask,
    duplicateTask,
    completeTask,
    toggleTimer,

    // Loading states
    isAdding,
    isEditing,
    isDeleting,
    isDuplicating,
    isCompleting,
    isTogglingTimer,
    isLoading,
  };
};
