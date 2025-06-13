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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Task } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CalendarIcon,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  MoreHorizontal,
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

// Minimal animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// const cardVariants = {
//   hidden: { opacity: 0, y: 10 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
// };

export default function DashboardPage() {
  const router = useRouter();
  const {
    currentWorkspace,
    isLoading,
    isHydrated,
    updateTask,
    deleteTask,
    moveTask,
    startTimer,
    stopTimer,
    addTask,
  } = useWorkspaceStore();
  const currentTime = new Date();
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    if (isHydrated && !isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, isHydrated, router]);

  // Add timer update effect
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

  // const generateHeatmapData = () => {
  //   if (!currentWorkspace) return [];

  //   // Generate mock data based on time entries
  //   const data = [];
  //   const startDate = new Date(new Date().getFullYear(), 0, 1);
  //   const endDate = new Date();

  //   for (
  //     let d = new Date(startDate);
  //     d <= endDate;
  //     d.setDate(d.getDate() + 1)
  //   ) {
  //     const dateStr = d.toISOString().split("T")[0];
  //     const value = Math.floor(Math.random() * 5);
  //     data.push({ date: dateStr, value });
  //   }

  //   return data;
  // };

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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

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

  const handleTaskEdit = async (
    taskId: string,
    field: keyof Task,
    value: string | number | boolean | Date | null
  ) => {
    await updateTask(taskId, { [field]: value });
    setEditingTask(null);
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

    // If dropped outside a valid drop zone
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      // Move task between columns or reorder within same column
      await moveTask(draggableId, destination.droppableId);
    } catch (error) {
      console.error("Failed to move task:", error);
      // Optionally show error toast/notification
    }
  };

  // Add this helper function for adding tasks to specific columns
  const handleAddTaskToColumn = async (columnName: string) => {
    await addTask({
      title: "New Task",
      description: "",
      column: columnName,
      priority: "medium",
    });
  };

  // Calculate weekly progress
  const totalTimeThisWeek = currentWorkspace.tasks.reduce(
    (total, task) => total + task.timeSpent,
    0
  );
  const weeklyGoalHours = currentWorkspace.weeklyGoals;
  const weeklyProgressPercentage = Math.min(
    (totalTimeThisWeek / 60 / weeklyGoalHours) * 100,
    100
  );

  // Group tasks by column
  const tasksByColumn = currentWorkspace.columns.reduce((acc, column) => {
    acc[column] = currentWorkspace.tasks.filter(
      (task) => task.column === column
    );
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div
      className={`${dosis.variable} h-screen flex bg-gray-50 dark:bg-gray-900`}
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
                    href="#"
                    className="font-dosis text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Workspace
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-dosis text-sm font-medium text-gray-900 dark:text-gray-100">
                    {currentWorkspace.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <Button
                onClick={() => handleAddTaskToColumn("Todo")}
                size="sm"
                className="font-dosis bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex flex-col max-w-full overflow-x-hidden">
            {/* Welcome Section */}
            <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="max-w-7xl mx-auto">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h1 className="font-dosis text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {getGreeting()},{" "}
                      {currentWorkspace.ownerName.split(" ")[0]} 👋
                    </h1>
                    <p className="font-dosis text-gray-600 dark:text-gray-400">
                      Here&apos;s how your week is looking.
                    </p>
                  </div>

                  {/* Weekly Progress */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-md flex items-center justify-center">
                          <Target className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                          Weekly Goal Progress
                        </span>
                      </div>
                      <span className="font-dosis text-sm text-gray-500 dark:text-gray-400">
                        {(totalTimeThisWeek / 60).toFixed(1)} /{" "}
                        {weeklyGoalHours}h
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000"
                        style={{ width: `${weeklyProgressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-hidden p-2">
              <motion.div
                className="h-full p-6 overflow-hidden flex flex-col"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <DragDropContext onDragEnd={onDragEnd}>
                  <div className="h-full overflow-x-auto overflow-y-hidden">
                    <div className="flex gap-4 h-full min-w-max pb-4">
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
                              <button
                                onClick={() => handleAddTaskToColumn(column)}
                                className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-md transition-colors"
                                title={`Add task to ${column}`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
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
                                            onClick={() =>
                                              handleAddTaskToColumn(column)
                                            }
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
                                                  "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm group transition-all duration-200",
                                                  snapshot.isDragging
                                                    ? "shadow-2xl rotate-1 scale-105 ring-2 ring-orange-200 dark:ring-orange-800 z-50"
                                                    : "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600",
                                                  task.isActive &&
                                                    "ring-2 ring-orange-200 dark:ring-orange-800 bg-orange-50/50 dark:bg-orange-950/20"
                                                )}
                                                style={{
                                                  userSelect: "none",
                                                  ...provided.draggableProps
                                                    .style,
                                                }}
                                              >
                                                <div className="p-4 space-y-3">
                                                  {/* Drag Handle Area */}
                                                  <div
                                                    {...provided.dragHandleProps}
                                                    className="flex items-start justify-between gap-2 cursor-grab active:cursor-grabbing"
                                                  >
                                                    {editingTask === task.id ? (
                                                      <Input
                                                        value={editValue}
                                                        onChange={(e) =>
                                                          setEditValue(
                                                            e.target.value
                                                          )
                                                        }
                                                        onBlur={() =>
                                                          handleTaskEdit(
                                                            task.id,
                                                            "title",
                                                            editValue
                                                          )
                                                        }
                                                        onKeyDown={(e) => {
                                                          if (
                                                            e.key === "Enter"
                                                          ) {
                                                            handleTaskEdit(
                                                              task.id,
                                                              "title",
                                                              editValue
                                                            );
                                                          }
                                                          if (
                                                            e.key === "Escape"
                                                          ) {
                                                            setEditingTask(
                                                              null
                                                            );
                                                          }
                                                        }}
                                                        className="text-sm font-medium flex-1 pointer-events-auto"
                                                        autoFocus
                                                        onClick={(e) =>
                                                          e.stopPropagation()
                                                        }
                                                        onMouseDown={(e) =>
                                                          e.stopPropagation()
                                                        }
                                                      />
                                                    ) : (
                                                      <h4
                                                        className="font-dosis font-medium text-gray-900 dark:text-gray-100 text-sm leading-relaxed flex-1 pointer-events-none"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setEditingTask(
                                                            task.id
                                                          );
                                                          setEditValue(
                                                            task.title
                                                          );
                                                        }}
                                                      >
                                                        {task.title}
                                                      </h4>
                                                    )}

                                                    {/* Action Buttons */}
                                                    <div
                                                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
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
                                                            onMouseDown={(e) =>
                                                              e.stopPropagation()
                                                            }
                                                          >
                                                            <MoreHorizontal className="w-4 h-4" />
                                                          </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                          <DropdownMenuItem
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              handleTaskDuplicate(
                                                                task
                                                              );
                                                            }}
                                                          >
                                                            <Copy className="w-4 h-4 mr-2" />
                                                            Duplicate
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem
                                                            onClick={(e) => {
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

                                                  {/* Priority and Due Date */}
                                                  <div className="flex items-center justify-between gap-2 pointer-events-none">
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
                                                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                                    <div className="flex items-center gap-2 pointer-events-none">
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
                                                        handleTimerToggle(task);
                                                      }}
                                                      onMouseDown={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                      className={cn(
                                                        "p-1.5 rounded-md transition-colors pointer-events-auto",
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
                    </div>
                  </div>
                </DragDropContext>
              </motion.div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

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
    </div>
  );
}
