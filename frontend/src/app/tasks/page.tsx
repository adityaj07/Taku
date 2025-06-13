"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Task } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Copy,
  Edit3,
  FileText,
  Kanban,
  List,
  MoreHorizontal,
  MoreVertical,
  Play,
  Plus,
  Square,
  Target,
  Trash2,
} from "lucide-react";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";

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
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    startTimer,
    stopTimer,
    updateWorkspaceSettings,
  } = useWorkspaceStore();

  // State management
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});
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

  // Timer update effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentWorkspace?.tasks) {
        const newActiveTimers: Record<string, number> = {};
        currentWorkspace.tasks.forEach((task) => {
          if (task.isActive && task.startTime) {
            const elapsed = Math.floor(
              (Date.now() - new Date(task.startTime).getTime()) / 1000
            );
            newActiveTimers[task.id] = elapsed;
          }
        });
        setActiveTimers(newActiveTimers);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentWorkspace?.tasks]);

  if (!isHydrated || isLoading || !currentWorkspace) {
    return (
      <div
        className={`${dosis.variable} min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="font-dosis text-gray-600 dark:text-gray-300">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Helper functions
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-3 h-3" />;
      case "medium":
        return <Circle className="w-3 h-3" />;
      case "low":
        return <CheckCircle2 className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-amber-600 dark:text-amber-400";
      case "low":
        return "text-emerald-600 dark:text-emerald-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const formatActiveTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Event handlers
  const handleAddTask = async () => {
    if (!newTaskForm.title.trim()) return;

    await addTask({
      title: newTaskForm.title,
      description: newTaskForm.description,
      column: newTaskForm.column,
      priority: newTaskForm.priority,
      dueDate: newTaskForm.dueDate || undefined,
    });

    setNewTaskForm({
      title: "",
      description: "",
      column: "Todo",
      priority: "medium",
      dueDate: "",
    });
    setIsAddTaskModalOpen(false);
  };

  const handleEditTask = async () => {
    if (!taskToEdit || !taskToEdit.title.trim()) return;

    await updateTask(taskToEdit.id, {
      title: taskToEdit.title,
      description: taskToEdit.description,
      priority: taskToEdit.priority,
      dueDate: taskToEdit.dueDate,
    });

    setTaskToEdit(null);
    setIsEditTaskModalOpen(false);
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;

    const newColumns = [...currentWorkspace.columns, newColumnName];
    await updateWorkspaceSettings({ columns: newColumns });
    setNewColumnName("");
    setIsAddColumnModalOpen(false);
  };

  const handleDeleteColumn = async () => {
    if (!columnToDelete) return;

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
  };

  const handleTaskComplete = async (taskId: string) => {
    await moveTask(taskId, "Done");
  };

  const handleTaskDuplicate = async (task: Task) => {
    await addTask({
      title: `${task.title} (Copy)`,
      description: task.description,
      column: task.column,
      priority: task.priority,
      dueDate: task.dueDate,
    });
  };

  const handleTaskDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const handleTimerToggle = async (task: Task) => {
    if (task.isActive) {
      await stopTimer(task.id);
    } else {
      await startTimer(task.id);
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
                <Dialog
                  open={isAddTaskModalOpen}
                  onOpenChange={setIsAddTaskModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="font-dosis bg-orange-500 hover:bg-orange-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-dosis">
                        Create New Task
                      </DialogTitle>
                      <DialogDescription className="font-dosis">
                        Add a new task to your workspace
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="font-dosis text-sm font-medium mb-2 block">
                          Task Title
                        </label>
                        <Input
                          placeholder="Enter task title..."
                          value={newTaskForm.title}
                          onChange={(e) =>
                            setNewTaskForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="font-dosis"
                        />
                      </div>

                      <div>
                        <label className="font-dosis text-sm font-medium mb-2 block">
                          Description (Optional)
                        </label>
                        <Textarea
                          placeholder="Add task description..."
                          value={newTaskForm.description}
                          onChange={(e) =>
                            setNewTaskForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="font-dosis resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-dosis text-sm font-medium mb-2 block">
                            Column
                          </label>
                          <Select
                            value={newTaskForm.column}
                            onValueChange={(value) =>
                              setNewTaskForm((prev) => ({
                                ...prev,
                                column: value,
                              }))
                            }
                          >
                            <SelectTrigger className="font-dosis">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {currentWorkspace.columns.map((column) => (
                                <SelectItem key={column} value={column}>
                                  {column}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="font-dosis text-sm font-medium mb-2 block">
                            Priority
                          </label>
                          <Select
                            value={newTaskForm.priority}
                            onValueChange={(value: "low" | "medium" | "high") =>
                              setNewTaskForm((prev) => ({
                                ...prev,
                                priority: value,
                              }))
                            }
                          >
                            <SelectTrigger className="font-dosis">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Low</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="medium">
                                <div className="flex items-center gap-2">
                                  <Circle className="w-3 h-3 text-amber-600" />
                                  <span>Medium</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="high">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-3 h-3 text-red-600" />
                                  <span>High</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="font-dosis text-sm font-medium mb-2 block">
                          Due Date (Optional)
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-dosis",
                                !newTaskForm.dueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newTaskForm.dueDate
                                ? format(new Date(newTaskForm.dueDate), "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={
                                newTaskForm.dueDate
                                  ? new Date(newTaskForm.dueDate)
                                  : undefined
                              }
                              onSelect={(date) => {
                                setNewTaskForm((prev) => ({
                                  ...prev,
                                  dueDate: date ? date.toISOString() : "",
                                }));
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddTaskModalOpen(false)}
                          className="font-dosis flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddTask}
                          disabled={!newTaskForm.title.trim()}
                          className="font-dosis flex-1 bg-orange-500 hover:bg-orange-600"
                        >
                          Create Task
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
              {/* Compact Stats Bar */}
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

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {viewMode === "kanban" ? (
                  // Kanban View
                  <div className="h-full p-6 overflow-hidden flex flex-col">
                    <DragDropContext onDragEnd={onDragEnd}>
                      <div className="flex-1 overflow-x-auto overflow-y-hidden">
                        <div className="flex gap-6 h-full min-w-max pb-4">
                          {currentWorkspace.columns.map((column) => {
                            const tasks = tasksByColumn[column] || [];
                            return (
                              <div
                                key={column}
                                className="flex-shrink-0 w-80 flex flex-col h-full"
                              >
                                {/* Column Header */}
                                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                                      {column}
                                    </h3>
                                    <span className="text-sm text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                                      {tasks.length}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setNewTaskForm((prev) => ({
                                          ...prev,
                                          column,
                                        }));
                                        setIsAddTaskModalOpen(true);
                                      }}
                                      className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-md transition-colors"
                                      title={`Add task to ${column}`}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>

                                    {/* Column Options */}
                                    {column !== "Todo" &&
                                      column !== "In Progress" &&
                                      column !== "Done" && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <button className="p-1.5 text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                                              <MoreVertical className="w-4 h-4" />
                                            </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              onClick={() =>
                                                setColumnToDelete(column)
                                              }
                                              className="text-red-600 focus:text-red-600"
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Delete Column
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                  </div>
                                </div>

                                {/* Droppable Column */}
                                <div className="flex-1 min-h-0 mt-2">
                                  <Droppable droppableId={column}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={cn(
                                          "h-full p-3 rounded-xl border-2 border-dashed transition-all duration-200 overflow-y-auto",
                                          snapshot.isDraggingOver
                                            ? "border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-950/20 shadow-lg"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/30 dark:bg-gray-800/30"
                                        )}
                                      >
                                        {tasks.length === 0 ? (
                                          <div
                                            className={cn(
                                              "flex flex-col items-center justify-center h-64 text-center transition-all duration-200",
                                              snapshot.isDraggingOver
                                                ? "text-orange-600"
                                                : "text-gray-500"
                                            )}
                                          >
                                            <div
                                              className={cn(
                                                "w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-200",
                                                snapshot.isDraggingOver
                                                  ? "bg-orange-100 dark:bg-orange-950/30"
                                                  : "bg-gray-100 dark:bg-gray-800"
                                              )}
                                            >
                                              <Square
                                                className={cn(
                                                  "w-8 h-8 transition-all duration-200",
                                                  snapshot.isDraggingOver
                                                    ? "text-orange-600"
                                                    : "text-gray-400"
                                                )}
                                              />
                                            </div>
                                            <p className="font-dosis dark:text-gray-400 mb-2">
                                              {snapshot.isDraggingOver
                                                ? `Drop task in ${column.toLowerCase()}`
                                                : `No tasks in ${column.toLowerCase()}`}
                                            </p>
                                            {!snapshot.isDraggingOver && (
                                              <button
                                                onClick={() => {
                                                  setNewTaskForm((prev) => ({
                                                    ...prev,
                                                    column,
                                                  }));
                                                  setIsAddTaskModalOpen(true);
                                                }}
                                                className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                                              >
                                                Add your first task
                                              </button>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="space-y-3">
                                            {tasks.map((task, index) => (
                                              <Draggable
                                                key={task.id}
                                                draggableId={task.id}
                                                index={index}
                                              >
                                                {(provided, snapshot) => (
                                                  <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={cn(
                                                      "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm group transition-all duration-200 cursor-grab active:cursor-grabbing",
                                                      snapshot.isDragging
                                                        ? "shadow-2xl rotate-1 scale-105 ring-2 ring-orange-200 dark:ring-orange-800 z-50"
                                                        : "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600",
                                                      task.isActive &&
                                                        "ring-2 ring-orange-200 dark:ring-orange-800 bg-orange-50/50 dark:bg-orange-950/20"
                                                    )}
                                                    style={{
                                                      userSelect: "none", // Prevent text selection
                                                      ...provided.draggableProps
                                                        .style,
                                                    }}
                                                  >
                                                    <div className="p-4 space-y-3">
                                                      {/* Title and Actions Row */}
                                                      <div
                                                        className="flex items-start justify-between gap-2"
                                                        {...provided.dragHandleProps}
                                                      >
                                                        <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100 text-sm leading-relaxed flex-1">
                                                          {task.title}
                                                        </h4>

                                                        {/* Action Buttons */}
                                                        <div
                                                          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                          onClick={(e) =>
                                                            e.stopPropagation()
                                                          }
                                                          onMouseDown={(e) =>
                                                            e.stopPropagation()
                                                          }
                                                        >
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setTaskToEdit(
                                                                task
                                                              );
                                                              setIsEditTaskModalOpen(
                                                                true
                                                              );
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="Edit task"
                                                          >
                                                            <Edit3 className="w-4 h-4" />
                                                          </button>
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              handleTaskComplete(
                                                                task.id
                                                              );
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                            title="Mark as complete"
                                                          >
                                                            <Check className="w-4 h-4" />
                                                          </button>
                                                          <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                              asChild
                                                            >
                                                              <button
                                                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                                onClick={(e) =>
                                                                  e.stopPropagation()
                                                                }
                                                              >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                              </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                              <DropdownMenuItem
                                                                onClick={(
                                                                  e
                                                                ) => {
                                                                  e.stopPropagation();
                                                                  handleTaskDuplicate(
                                                                    task
                                                                  );
                                                                }}
                                                              >
                                                                <Copy className="w-4 h-4 mr-2" />
                                                                Duplicate
                                                              </DropdownMenuItem>
                                                              <DropdownMenuSeparator />
                                                              <DropdownMenuItem
                                                                onClick={(
                                                                  e
                                                                ) => {
                                                                  e.stopPropagation();
                                                                  setTaskToDelete(
                                                                    task
                                                                  );
                                                                }}
                                                                className="text-red-600"
                                                              >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                              </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                          </DropdownMenu>
                                                        </div>
                                                      </div>

                                                      {/* Description */}
                                                      {task.description && (
                                                        <p className="font-dosis text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                                          {task.description}
                                                        </p>
                                                      )}

                                                      {/* Priority and Due Date */}
                                                      <div
                                                        className="flex items-center justify-between gap-2"
                                                        onClick={(e) =>
                                                          e.stopPropagation()
                                                        }
                                                      >
                                                        {/* Priority */}
                                                        <div
                                                          className={cn(
                                                            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-gray-50 dark:bg-gray-700/50",
                                                            getPriorityColor(
                                                              task.priority
                                                            )
                                                          )}
                                                        >
                                                          {getPriorityIcon(
                                                            task.priority
                                                          )}
                                                          <span className="capitalize font-medium">
                                                            {task.priority}
                                                          </span>
                                                        </div>

                                                        {/* Due Date */}
                                                        {task.dueDate && (
                                                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                                            <CalendarIcon className="w-3 h-3" />
                                                            {format(
                                                              new Date(
                                                                task.dueDate
                                                              ),
                                                              "MMM dd"
                                                            )}
                                                          </div>
                                                        )}
                                                      </div>

                                                      {/* Timer Section */}
                                                      <div
                                                        className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700"
                                                        onClick={(e) =>
                                                          e.stopPropagation()
                                                        }
                                                      >
                                                        <div className="flex items-center gap-2">
                                                          <span className="text-xs text-gray-500 font-mono">
                                                            {formatTime(
                                                              task.timeSpent
                                                            )}
                                                          </span>
                                                          {task.isActive && (
                                                            <span className="text-xs font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded animate-pulse">
                                                              {formatActiveTime(
                                                                activeTimers[
                                                                  task.id
                                                                ] || 0
                                                              )}
                                                            </span>
                                                          )}
                                                        </div>

                                                        <button
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleTimerToggle(
                                                              task
                                                            );
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
                                                )}
                                              </Draggable>
                                            ))}
                                            {provided.placeholder}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Droppable>
                                </div>
                              </div>
                            );
                          })}

                          {/* Add Column */}
                          <div className="flex-shrink-0 w-80">
                            <Dialog
                              open={isAddColumnModalOpen}
                              onOpenChange={setIsAddColumnModalOpen}
                            >
                              <DialogTrigger asChild>
                                <div className="h-full min-h-[600px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center p-6">
                                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                  </div>
                                  <h3 className="font-dosis font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Add Column
                                  </h3>
                                  <p className="font-dosis text-sm text-gray-500 dark:text-gray-400">
                                    Create a new column to organize your tasks
                                  </p>
                                </div>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="font-dosis">
                                    Add New Column
                                  </DialogTitle>
                                  <DialogDescription className="font-dosis">
                                    Create a new column for organizing your
                                    tasks
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="font-dosis text-sm font-medium mb-2 block">
                                      Column Name
                                    </label>
                                    <Input
                                      placeholder="e.g., Review, Testing, Blocked"
                                      value={newColumnName}
                                      onChange={(e) =>
                                        setNewColumnName(e.target.value)
                                      }
                                      className="font-dosis"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                          handleAddColumn();
                                      }}
                                    />
                                  </div>
                                  <div className="flex gap-3 pt-2">
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setIsAddColumnModalOpen(false)
                                      }
                                      className="font-dosis flex-1"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleAddColumn}
                                      disabled={!newColumnName.trim()}
                                      className="font-dosis flex-1 bg-orange-500 hover:bg-orange-600"
                                    >
                                      Add Column
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </DragDropContext>
                  </div>
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
                                    <div
                                      key={task.id}
                                      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all duration-200"
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
                                                  task.priority === "high" &&
                                                    "bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400",
                                                  task.priority === "medium" &&
                                                    "bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400",
                                                  task.priority === "low" &&
                                                    "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                                                )}
                                              >
                                                {getPriorityIcon(task.priority)}
                                                <span className="capitalize">
                                                  {task.priority}
                                                </span>
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
                                                    Due{" "}
                                                    {format(
                                                      new Date(task.dueDate),
                                                      "MMM dd"
                                                    )}
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
                                                    {formatActiveTime(
                                                      activeTimers[task.id] || 0
                                                    )}
                                                  </span>
                                                )}
                                              </div>

                                              {/* Created Date */}
                                              <div className="flex items-center gap-1">
                                                <span className="font-dosis">
                                                  Created{" "}
                                                  {format(
                                                    new Date(task.createdAt),
                                                    "MMM dd"
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Actions */}
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              onClick={() => {
                                                setTaskToEdit(task);
                                                setIsEditTaskModalOpen(true);
                                              }}
                                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                              title="Edit task"
                                            >
                                              <Edit3 className="w-4 h-4" />
                                            </button>

                                            <button
                                              onClick={() =>
                                                handleTaskComplete(task.id)
                                              }
                                              className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-md hover:bg-green-50 dark:hover:bg-green-950/20"
                                              title="Mark as complete"
                                            >
                                              <Check className="w-4 h-4" />
                                            </button>

                                            <button
                                              onClick={() =>
                                                handleTimerToggle(task)
                                              }
                                              className={cn(
                                                "p-2 rounded-md transition-colors",
                                                task.isActive
                                                  ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                  : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                                              )}
                                              title={
                                                task.isActive
                                                  ? "Stop timer"
                                                  : "Start timer"
                                              }
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
                                                <DropdownMenuItem
                                                  onClick={() =>
                                                    handleTaskDuplicate(task)
                                                  }
                                                >
                                                  <Copy className="w-4 h-4 mr-2" />
                                                  Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                  onClick={() =>
                                                    setTaskToDelete(task)
                                                  }
                                                  className="text-red-600"
                                                >
                                                  <Trash2 className="w-4 h-4 mr-2" />
                                                  Delete
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
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

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskModalOpen} onOpenChange={setIsEditTaskModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-dosis">Edit Task</DialogTitle>
            <DialogDescription className="font-dosis">
              Update task details
            </DialogDescription>
          </DialogHeader>
          {taskToEdit && (
            <div className="space-y-4">
              <div>
                <label className="font-dosis text-sm font-medium mb-2 block">
                  Task Title
                </label>
                <Input
                  placeholder="Enter task title..."
                  value={taskToEdit.title}
                  onChange={(e) =>
                    setTaskToEdit((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                  className="font-dosis"
                />
              </div>

              <div>
                <label className="font-dosis text-sm font-medium mb-2 block">
                  Description (Optional)
                </label>
                <Textarea
                  placeholder="Add task description..."
                  value={taskToEdit.description || ""}
                  onChange={(e) =>
                    setTaskToEdit((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  className="font-dosis resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-dosis text-sm font-medium mb-2 block">
                    Priority
                  </label>
                  <Select
                    value={taskToEdit.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setTaskToEdit((prev) =>
                        prev ? { ...prev, priority: value } : null
                      )
                    }
                  >
                    <SelectTrigger className="font-dosis">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Low</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Circle className="w-3 h-3 text-amber-600" />
                          <span>Medium</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          <span>High</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-dosis text-sm font-medium mb-2 block">
                    Due Date (Optional)
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-dosis",
                          !taskToEdit.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {taskToEdit.dueDate
                          ? format(new Date(taskToEdit.dueDate), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          taskToEdit.dueDate
                            ? new Date(taskToEdit.dueDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          setTaskToEdit((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  dueDate: date
                                    ? date.toISOString()
                                    : undefined,
                                }
                              : null
                          );
                        }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditTaskModalOpen(false)}
                  className="font-dosis flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditTask}
                  disabled={!taskToEdit.title.trim()}
                  className="font-dosis flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={() => setTaskToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTaskDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Column Dialog */}
      <AlertDialog
        open={!!columnToDelete}
        onOpenChange={() => setColumnToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the &quot;{columnToDelete}&quot;
              column? All tasks in this column will be moved to
              &quot;Todo&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteColumn}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
