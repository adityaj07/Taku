"use client";

import { AppSidebar } from "@/components/app-sidebar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Task, TimeEntry } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store";
import { addDays, format, isSameDay, isToday, startOfWeek } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Edit3,
  FileText,
  Plus,
  Save,
  Target,
  Timer,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const dosis = Dosis({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
});

interface TimeEntryForm {
  taskId: string;
  taskTitle: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface EditingTimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  description: string;
}

export default function TimesheetPage() {
  const router = useRouter();
  const {
    currentWorkspace,
    isLoading,
    isHydrated,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
  } = useWorkspaceStore();

  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
    new Set()
  );
  const [editingEntry, setEditingEntry] = useState<EditingTimeEntry | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEntryForm, setNewEntryForm] = useState<TimeEntryForm>({
    taskId: "",
    taskTitle: "",
    startTime: "",
    endTime: "",
    description: "",
  });

  // Get week dates starting from Monday
  const getWeekDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  // Calculate daily progress (assuming 8-hour goal)
  const getDailyProgress = (date: Date) => {
    if (!currentWorkspace) return 0;
    const dayEntries = currentWorkspace.timeEntries.filter((entry) =>
      isSameDay(new Date(entry.startTime), date)
    );
    const totalMinutes = dayEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );
    const dailyGoalMinutes = 8 * 60; // 8 hours
    return Math.min((totalMinutes / dailyGoalMinutes) * 100, 100);
  };

  // Get selected day entries with associated task data
  const getSelectedDayEntries = () => {
    if (!currentWorkspace) return [];

    return currentWorkspace.timeEntries
      .filter((entry) => isSameDay(new Date(entry.startTime), selectedDate))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
      .map((entry) => {
        const task = currentWorkspace.tasks.find((t) => t.id === entry.taskId);
        return { ...entry, task };
      });
  };

  // Calculate weekly stats
  const getWeeklyStats = () => {
    if (!currentWorkspace) return { total: 0, average: 0, progress: 0 };

    const weekDates = getWeekDates();
    let totalMinutes = 0;

    weekDates.forEach((date) => {
      const dayEntries = currentWorkspace.timeEntries.filter((entry) =>
        isSameDay(new Date(entry.startTime), date)
      );
      totalMinutes += dayEntries.reduce(
        (sum, entry) => sum + entry.duration,
        0
      );
    });

    const weeklyGoalMinutes = currentWorkspace.weeklyGoals * 60;
    const average = totalMinutes / 7;
    const progress = Math.min((totalMinutes / weeklyGoalMinutes) * 100, 100);

    return { total: totalMinutes, average, progress };
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), "HH:mm");
  };

  const formatTimeInput = (timeString: string) => {
    return format(new Date(timeString), "HH:mm");
  };

  const toggleEntryExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
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
        return "text-red-500 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-800";
      case "medium":
        return "text-amber-500 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-800";
      case "low":
        return "text-emerald-500 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-800";
      default:
        return "text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800";
    }
  };

  const getColumnColor = (column: string) => {
    switch (column.toLowerCase()) {
      case "todo":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-800";
      case "in progress":
        return "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-800";
      case "done":
        return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800";
    }
  };

  const handleAddEntry = async () => {
    if (!newEntryForm.startTime || !newEntryForm.endTime) return;
    if (!newEntryForm.taskId && !newEntryForm.taskTitle) return;

    const startTime = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${newEntryForm.startTime}`
    );
    const endTime = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${newEntryForm.endTime}`
    );
    const duration = Math.max(
      0,
      Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    );

    await addTimeEntry({
      taskId: newEntryForm.taskId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      description: newEntryForm.description,
    });

    setNewEntryForm({
      taskId: "",
      taskTitle: "",
      startTime: "",
      endTime: "",
      description: "",
    });
    setIsAddModalOpen(false);
  };

  const handleEditEntry = async () => {
    if (!editingEntry) return;

    const startTime = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${editingEntry.startTime}`
    );
    const endTime = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${editingEntry.endTime}`
    );
    const duration = Math.max(
      0,
      Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    );

    await updateTimeEntry(editingEntry.id, {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      description: editingEntry.description,
    });

    setEditingEntry(null);
  };

  const handleDeleteEntry = async (entryId: string) => {
    await deleteTimeEntry(entryId);
  };

  const startEditingEntry = (entry: TimeEntry & { task?: Task }) => {
    setEditingEntry({
      id: entry.id,
      startTime: formatTimeInput(entry.startTime),
      endTime: entry.endTime ? formatTimeInput(entry.endTime) : "",
      description: entry.description || "",
    });
  };

  useEffect(() => {
    if (isHydrated && !isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, isHydrated, router]);

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

  const weekDates = getWeekDates();
  const selectedDayEntries = getSelectedDayEntries();
  const weeklyStats = getWeeklyStats();

  return (
    <div
      className={`${dosis.variable} h-screen flex bg-gray-50 dark:bg-gray-900`}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
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
                    Timesheet
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="font-dosis bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-dosis">
                      Add Time Entry
                    </DialogTitle>
                    <DialogDescription className="font-dosis">
                      Create a new time entry for{" "}
                      {format(selectedDate, "MMMM dd, yyyy")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="font-dosis text-sm font-medium">
                        Task
                      </label>
                      <div className="space-y-2">
                        <Select
                          value={newEntryForm.taskId}
                          onValueChange={(value) => {
                            const task = currentWorkspace.tasks.find(
                              (t) => t.id === value
                            );
                            setNewEntryForm((prev) => ({
                              ...prev,
                              taskId: value,
                              taskTitle: task ? task.title : "",
                            }));
                          }}
                        >
                          <SelectTrigger className="font-dosis">
                            <SelectValue placeholder="Select existing task" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentWorkspace.tasks.map((task) => (
                              <SelectItem key={task.id} value={task.id}>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      "px-2 py-1 rounded-md text-xs border",
                                      getColumnColor(task.column)
                                    )}
                                  >
                                    {task.column}
                                  </span>
                                  <span>{task.title}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                          or
                        </div>
                        <Input
                          placeholder="Enter custom task name"
                          value={newEntryForm.taskTitle}
                          onChange={(e) =>
                            setNewEntryForm((prev) => ({
                              ...prev,
                              taskTitle: e.target.value,
                              taskId: "",
                            }))
                          }
                          className="font-dosis"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="font-dosis text-sm font-medium">
                          Start Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="time"
                            value={newEntryForm.startTime}
                            onChange={(e) =>
                              setNewEntryForm((prev) => ({
                                ...prev,
                                startTime: e.target.value,
                              }))
                            }
                            className="font-dosis pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="font-dosis text-sm font-medium">
                          End Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="time"
                            value={newEntryForm.endTime}
                            onChange={(e) =>
                              setNewEntryForm((prev) => ({
                                ...prev,
                                endTime: e.target.value,
                              }))
                            }
                            className="font-dosis pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-dosis text-sm font-medium">
                        Description (Optional)
                      </label>
                      <Textarea
                        placeholder="Add notes about this time entry..."
                        value={newEntryForm.description}
                        onChange={(e) =>
                          setNewEntryForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="font-dosis resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddModalOpen(false)}
                        className="font-dosis flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddEntry}
                        disabled={
                          !newEntryForm.startTime ||
                          !newEntryForm.endTime ||
                          (!newEntryForm.taskId && !newEntryForm.taskTitle)
                        }
                        className="font-dosis flex-1 bg-orange-500 hover:bg-orange-600"
                      >
                        Add Entry
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Weekly Strip */}
            <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isCurrentDay = isToday(date);
                    const progress = getDailyProgress(date);

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "relative p-3 rounded-lg transition-all duration-200 group",
                          isSelected
                            ? "bg-orange-500 text-white shadow-md"
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
                          isCurrentDay &&
                            !isSelected &&
                            "ring-2 ring-orange-300 dark:ring-orange-600"
                        )}
                      >
                        <div className="text-center space-y-1">
                          <div className="font-dosis text-xs font-medium opacity-75">
                            {format(date, "EEE").toUpperCase()}
                          </div>
                          <div className="font-dosis text-lg font-bold">
                            {format(date, "d")}
                          </div>

                          {/* Progress Ring */}
                          <div className="relative w-6 h-6 mx-auto">
                            <svg
                              className="w-6 h-6 transform -rotate-90"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                className="opacity-20"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                stroke={
                                  isSelected ? "white" : "rgb(249 115 22)"
                                }
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 9}`}
                                strokeDashoffset={
                                  2 * Math.PI * 9 * (1 - progress / 100)
                                }
                                className="transition-all duration-1000"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-bold">
                                {Math.round(progress)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Time Entries */}
              <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h2 className="font-dosis text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {format(selectedDate, "EEEE, MMMM dd")}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Timer className="w-4 h-4" />
                      <span className="font-dosis">
                        {selectedDayEntries.length}{" "}
                        {selectedDayEntries.length === 1 ? "entry" : "entries"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="max-w-4xl mx-auto space-y-3">
                    {selectedDayEntries.length === 0 ? (
                      <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="font-dosis text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No entries yet
                        </h3>
                        <p className="font-dosis text-gray-600 dark:text-gray-400 mb-6">
                          Start tracking your time for this day
                        </p>
                        <Button
                          onClick={() => setIsAddModalOpen(true)}
                          className="font-dosis bg-orange-500 hover:bg-orange-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Entry
                        </Button>
                      </div>
                    ) : (
                      selectedDayEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all duration-200"
                        >
                          <div className="p-4">
                            {editingEntry?.id === entry.id ? (
                              // Edit Mode
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                                    Edit Time Entry
                                  </h4>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      onClick={handleEditEntry}
                                      className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
                                    >
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingEntry(null)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="font-dosis text-sm font-medium mb-1 block">
                                      Start Time
                                    </label>
                                    <div className="relative">
                                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                      <Input
                                        type="time"
                                        value={editingEntry.startTime}
                                        onChange={(e) =>
                                          setEditingEntry((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  startTime: e.target.value,
                                                }
                                              : null
                                          )
                                        }
                                        className="font-dosis pl-10"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="font-dosis text-sm font-medium mb-1 block">
                                      End Time
                                    </label>
                                    <div className="relative">
                                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                      <Input
                                        type="time"
                                        value={editingEntry.endTime}
                                        onChange={(e) =>
                                          setEditingEntry((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  endTime: e.target.value,
                                                }
                                              : null
                                          )
                                        }
                                        className="font-dosis pl-10"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="font-dosis text-sm font-medium mb-1 block">
                                    Description
                                  </label>
                                  <Textarea
                                    value={editingEntry.description}
                                    onChange={(e) =>
                                      setEditingEntry((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              description: e.target.value,
                                            }
                                          : null
                                      )
                                    }
                                    className="font-dosis resize-none"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-3">
                                    {entry.task ? (
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                                          {entry.task.title}
                                        </h4>
                                        <span
                                          className={cn(
                                            "px-2 py-1 rounded-md text-xs border font-medium",
                                            getColumnColor(entry.task.column)
                                          )}
                                        >
                                          {entry.task.column}
                                        </span>
                                        <span
                                          className={cn(
                                            "px-2 py-1 rounded-md text-xs border font-medium flex items-center gap-1",
                                            getPriorityColor(
                                              entry.task.priority
                                            )
                                          )}
                                        >
                                          {getPriorityIcon(entry.task.priority)}
                                          {entry.task.priority}
                                        </span>
                                        {entry.task.dueDate && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(
                                              new Date(entry.task.dueDate),
                                              "MMM dd"
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                                          Manual Entry
                                        </h4>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-mono flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTime(entry.startTime)} -{" "}
                                      {entry.endTime
                                        ? formatTime(entry.endTime)
                                        : "ongoing"}
                                    </span>
                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 rounded font-dosis font-medium">
                                      {formatDuration(entry.duration)}
                                    </span>
                                  </div>

                                  {entry.description && (
                                    <AnimatePresence>
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{
                                          opacity: expandedEntries.has(entry.id)
                                            ? 1
                                            : 0,
                                          height: expandedEntries.has(entry.id)
                                            ? "auto"
                                            : 0,
                                        }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <p className="font-dosis text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                          {entry.description}
                                        </p>
                                      </motion.div>
                                    </AnimatePresence>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {entry.description && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        toggleEntryExpansion(entry.id)
                                      }
                                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                      {expandedEntries.has(entry.id) ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditingEntry(entry)}
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Weekly Summary Sidebar */}
              <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-dosis text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Weekly Summary
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                          Total Tracked
                        </span>
                        <span className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                          {formatDuration(weeklyStats.total)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                          Daily Average
                        </span>
                        <span className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                          {formatDuration(weeklyStats.average)}
                        </span>
                      </div>

                      <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                            Weekly Goal
                          </span>
                          <span className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                            {Math.round(weeklyStats.progress)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-1000"
                            style={{ width: `${weeklyStats.progress}%` }}
                          />
                        </div>
                        <p className="font-dosis text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {formatDuration(weeklyStats.total)} of{" "}
                          {currentWorkspace.weeklyGoals}h goal
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
