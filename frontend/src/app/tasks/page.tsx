"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Loading from "@/components/Loading";
import { TaskCard } from "@/components/TaskCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useTaskActions } from "@/hooks/tasks/useTaskActions";
import { useTaskTimer } from "@/hooks/tasks/useTaskTimer";
import { Task } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store";
import { FileText, MoreVertical, Plus, Square, Trash2 } from "lucide-react";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { AddColumnModal } from "./_components/modals/AddColumnModal";
import { AddTaskModal } from "./_components/modals/AddTaskModal";
import { DeleteColumnDialog } from "./_components/modals/DeleteColumnDialog";
import { DeleteTaskDialog } from "./_components/modals/DeleteTaskDialog";
import { EditTaskModal } from "./_components/modals/EditTaskModal";
import StatsBar from "./_components/StatsBar";
import { KanbanBoard } from "./_components/KanbanBoard";

const dosis = Dosis({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
});

export default function TasksPage() {
  const router = useRouter();
  const {
    currentWorkspace,
    isLoading,
    isHydrated,

    updateTask,

    moveTask,
    startTimer,
    stopTimer,
    updateWorkspaceSettings,
  } = useWorkspaceStore();

  const {
    addTask,
    editTask,
    deleteTask,
    duplicateTask,
    completeTask,
    toggleTimer,
    isAdding,
    isDeleting,
    isEditing,
    isLoading: isTaskActionLoading,
  } = useTaskActions();
  const { activeTimers, formatActiveTime } = useTaskTimer();

  // State management
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    column: "Todo",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  });

  useEffect(() => {
    if (isHydrated && !isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, isHydrated, router]);

  if (!isHydrated || isLoading || !currentWorkspace) {
    return <Loading />;
  }

  // // Event handlers
  const handleAddTask = async () => {
    if (!newTaskForm.title.trim()) return;

    try {
      await addTask({
        title: newTaskForm.title,
        description: newTaskForm.description,
        column: newTaskForm.column,
        priority: newTaskForm.priority,
        dueDate: newTaskForm.dueDate || undefined,
      });

      // Reset form and close modal only on success
      setNewTaskForm({
        title: "",
        description: "",
        column: "Todo",
        priority: "medium",
        dueDate: "",
      });
      setIsAddTaskModalOpen(false);
    } catch (error) {
      // Error is already handled by the hook, just log or handle UI state if needed
      console.log("Add task failed, keeping modal open");
    }
  };

  const handleEditTask = async () => {
    if (!taskToEdit || !taskToEdit.title.trim()) return;

    try {
      await editTask(taskToEdit.id, {
        title: taskToEdit.title,
        description: taskToEdit.description,
        priority: taskToEdit.priority,
        dueDate: taskToEdit.dueDate,
      });

      // Reset state only on success
      setTaskToEdit(null);
      setIsEditTaskModalOpen(false);
    } catch (error) {
      console.log("Edit task failed, keeping modal open");
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;

    try {
      const newColumns = [...currentWorkspace.columns, newColumnName];
      await updateWorkspaceSettings({ columns: newColumns });
      setNewColumnName("");
      setIsAddColumnModalOpen(false);
    } catch (error) {
      console.log("Adding a Column failed, keeping modal open");
    }
  };

  const handleDeleteColumn = async () => {
    if (!columnToDelete) return;

    try {
      // Move all tasks from this column to "Todo" column
      const tasksInColumn = currentWorkspace.tasks.filter(
        (task) => task.column === columnToDelete
      );

      for (const task of tasksInColumn) {
        await updateTask(task.id, { column: "Todo" });
      }

      // Remove column from workspace
      const newColumns = currentWorkspace.columns.filter(
        (col) => col !== columnToDelete
      );
      await updateWorkspaceSettings({ columns: newColumns });

      setColumnToDelete(null);
    } catch (error) {
      console.log("Deleting column failed, keeping modal open");
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      await moveTask(taskId, "Done");
    } catch (error) {
      console.log("Moving task failed, keeping modal open");
    }
  };

  const handleTaskDuplicate = async (task: Task) => {
    try {
      await addTask({
        title: `${task.title} (Copy)`,
        description: task.description,
        column: task.column,
        priority: task.priority,
        dueDate: task.dueDate,
      });
    } catch (error) {
      console.log("Adding duplicate task failed, keeping modal open");
    }
  };

  const handleTaskDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    } catch (error) {
      console.log("Delete task failed");
    }
  };

  const handleTimerToggle = async (task: Task) => {
    try {
      if (task.isActive) {
        await stopTimer(task.id);
      } else {
        await startTimer(task.id);
      }
    } catch (error) {
      console.log("Timer toggling failed, keeping modal open");
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      await moveTask(draggableId, destination.droppableId);
    } catch (error) {
      console.error("Failed to move task:", error);
    }
  };

  // Group tasks by column
  const tasksByColumn = currentWorkspace.columns.reduce((acc, column) => {
    acc[column] = currentWorkspace.tasks.filter(
      (task) => task.column === column
    );
    return acc;
  }, {} as Record<string, Task[]>);

  // Stats calculations
  const totalTasks = currentWorkspace.tasks.length;
  const completedTasks = currentWorkspace.tasks.filter(
    (task) => task.column === "Done"
  ).length;
  const inProgressTasks = currentWorkspace.tasks.filter(
    (task) => task.column === "In Progress"
  ).length;
  const totalTimeSpent = currentWorkspace.tasks.reduce(
    (sum, task) => sum + task.timeSpent,
    0
  );

  return (
    <>
      <div
        className={`${dosis.variable} h-screen flex bg-white dark:bg-gray-900 overflow-hidden`}
      >
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col min-w-0 flex-1">
            {/* Header */}
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      href="/dashboard"
                      className="font-dosis text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      {currentWorkspace.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-dosis text-sm font-medium text-gray-900 dark:text-gray-100">
                      Tasks
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              {/* Header Actions */}
              <div className="ml-auto flex items-center gap-2">
                {/* Add Task Button */}
                <AddTaskModal
                  isOpen={isAddTaskModalOpen}
                  onClose={() => setIsAddTaskModalOpen(false)}
                  onSubmit={handleAddTask}
                  formData={newTaskForm}
                  onFormChange={setNewTaskForm}
                  columns={currentWorkspace.columns}
                  isLoading={isAdding}
                />
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
              {/* Compact Stats Bar */}
              <StatsBar
                completedTasks={completedTasks}
                inProgressTasks={inProgressTasks}
                totalTasks={totalTasks}
                totalTimeSpent={totalTimeSpent}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {viewMode === "kanban" ? (
                  // Kanban View
                  <KanbanBoard
                    columns={currentWorkspace.columns}
                    tasksByColumn={tasksByColumn}
                    activeTimers={activeTimers}
                    onDragEnd={onDragEnd}
                    onAddTask={(column) => {
                      setNewTaskForm((prev) => ({ ...prev, column }));
                      setIsAddTaskModalOpen(true);
                    }}
                    onAddColumn={() => setIsAddColumnModalOpen(true)}
                    onDeleteColumn={setColumnToDelete}
                    onEditTask={(task) => {
                      setTaskToEdit(task);
                      setIsEditTaskModalOpen(true);
                    }}
                    onDeleteTask={setTaskToDelete}
                    onCompleteTask={handleTaskComplete}
                    onDuplicateTask={handleTaskDuplicate}
                    onTimerToggle={handleTimerToggle}
                  />
                ) : (
                  // List View
                  <div className="h-full overflow-y-auto">
                    {currentWorkspace.tasks.length === 0 ? (
                      <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="font-dosis text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No tasks yet
                        </h3>
                        <p className="font-dosis text-gray-600 dark:text-gray-400 mb-6">
                          Create your first task to get started
                        </p>
                        <Button
                          onClick={() => setIsAddTaskModalOpen(true)}
                          className="font-dosis bg-orange-500 hover:bg-orange-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Task
                        </Button>
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="max-w-7xl mx-auto space-y-8">
                          {currentWorkspace.columns.map((column) => {
                            const tasks = tasksByColumn[column] || [];
                            if (tasks.length === 0) return null;

                            return (
                              <div key={column} className="space-y-4">
                                {/* Column Header */}
                                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                  <h2 className="font-dosis text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {column}
                                  </h2>
                                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                                    {tasks.length}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setNewTaskForm((prev) => ({
                                        ...prev,
                                        column,
                                      }));
                                      setIsAddTaskModalOpen(true);
                                    }}
                                    className="font-dosis text-xs h-8"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Task
                                  </Button>
                                </div>

                                {/* Tasks List */}
                                <div className="space-y-2">
                                  {tasks.map((task) => (
                                    <TaskCard
                                      key={task.id}
                                      task={task}
                                      activeTimer={activeTimers[task.id]}
                                      variant="list"
                                      onEdit={(task) => {
                                        setTaskToEdit(task);
                                        setIsEditTaskModalOpen(true);
                                      }}
                                      onDelete={setTaskToDelete}
                                      onComplete={handleTaskComplete}
                                      onDuplicate={handleTaskDuplicate}
                                      onTimerToggle={handleTimerToggle}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

      {/* Add Column */}
      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onSubmit={handleAddColumn}
        columnName={newColumnName}
        onColumnNameChange={setNewColumnName}
      />

      {/* Edit Task Dialog */}
      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        onSubmit={handleEditTask}
        task={taskToEdit}
        onTaskChange={setTaskToEdit}
        isLoading={isEditing}
      />

      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleTaskDelete}
        isLoading={isDeleting}
      />

      {/* Delete Column Dialog */}
      <DeleteColumnDialog
        columnName={columnToDelete}
        onClose={() => setColumnToDelete(null)}
        onConfirm={handleDeleteColumn}
      />
    </>
  );
}
