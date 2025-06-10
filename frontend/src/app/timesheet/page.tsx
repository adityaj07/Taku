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
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceStore } from "@/store";
import { addDays, format, isSameDay, isToday, startOfWeek } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Plus,
  Target,
  Timer,
  Trash2,
} from "lucide-react";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const dosis = Dosis({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const progressVariants = {
  hidden: { width: 0 },
  visible: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 1.5,
      ease: "easeOut",
      delay: 0.5,
    },
  }),
};

interface TimeEntryForm {
  taskTitle: string;
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
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEntryForm, setNewEntryForm] = useState<TimeEntryForm>({
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

  // Get selected day entries
  const getSelectedDayEntries = () => {
    if (!currentWorkspace) return [];
    return currentWorkspace.timeEntries
      .filter((entry) => isSameDay(new Date(entry.startTime), selectedDate))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
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

  const toggleEntryExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const handleAddEntry = async () => {
    if (
      !newEntryForm.taskTitle ||
      !newEntryForm.startTime ||
      !newEntryForm.endTime
    )
      return;

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
      taskId: "", // For manual entries, this can be empty or linked to a task
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      description: newEntryForm.description,
    });

    setNewEntryForm({
      taskTitle: "",
      startTime: "",
      endTime: "",
      description: "",
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteEntry = async (entryId: string) => {
    await deleteTimeEntry(entryId);
  };

  useEffect(() => {
    if (isHydrated && !isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, isHydrated, router]);

  if (!isHydrated || isLoading || !currentWorkspace) {
    return (
      <div
        className={`${dosis.variable} min-h-screen flex items-center justify-center`}
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
    <div className={dosis.variable}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header with Breadcrumbs */}
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 px-4">
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
            </div>
          </header>

          {/* Main Content */}
          <motion.main
            className="flex-1 p-6 space-y-6 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Page Header */}
            <motion.div variants={cardVariants} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-dosis text-3xl font-bold text-gray-900 dark:text-gray-100">
                      Timesheet
                    </h1>
                    <p className="font-dosis text-lg text-gray-600 dark:text-gray-400">
                      Track and analyze your time
                    </p>
                  </div>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="font-dosis bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg">
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
                      <div>
                        <label className="font-dosis text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          Task Title
                        </label>
                        <Input
                          placeholder="What did you work on?"
                          value={newEntryForm.taskTitle}
                          onChange={(e) =>
                            setNewEntryForm((prev) => ({
                              ...prev,
                              taskTitle: e.target.value,
                            }))
                          }
                          className="font-dosis"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-dosis text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Start Time
                          </label>
                          <Input
                            type="time"
                            value={newEntryForm.startTime}
                            onChange={(e) =>
                              setNewEntryForm((prev) => ({
                                ...prev,
                                startTime: e.target.value,
                              }))
                            }
                            className="font-dosis"
                          />
                        </div>
                        <div>
                          <label className="font-dosis text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            End Time
                          </label>
                          <Input
                            type="time"
                            value={newEntryForm.endTime}
                            onChange={(e) =>
                              setNewEntryForm((prev) => ({
                                ...prev,
                                endTime: e.target.value,
                              }))
                            }
                            className="font-dosis"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-dosis text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
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
                      <div className="flex gap-3">
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
                            !newEntryForm.taskTitle ||
                            !newEntryForm.startTime ||
                            !newEntryForm.endTime
                          }
                          className="font-dosis flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                        >
                          Add Entry
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>

            {/* Weekly Strip */}
            <motion.div variants={cardVariants}>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <div className="grid grid-cols-7 gap-3">
                  {weekDates.map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isCurrentDay = isToday(date);
                    const progress = getDailyProgress(date);

                    return (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          relative p-4 rounded-xl transition-all duration-300 group
                          ${
                            isSelected
                              ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                              : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }
                          ${
                            isCurrentDay && !isSelected
                              ? "ring-2 ring-orange-300 dark:ring-orange-600"
                              : ""
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-center space-y-2">
                          <div className="font-dosis text-xs font-medium opacity-75">
                            {format(date, "EEE").toUpperCase()}
                          </div>
                          <div className="font-dosis text-lg font-bold">
                            {format(date, "d")}
                          </div>

                          {/* Progress Ring */}
                          <div className="relative w-8 h-8 mx-auto">
                            <svg
                              className="w-8 h-8 transform -rotate-90"
                              viewBox="0 0 32 32"
                            >
                              <circle
                                cx="16"
                                cy="16"
                                r="12"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                className="opacity-20"
                              />
                              <motion.circle
                                cx="16"
                                cy="16"
                                r="12"
                                stroke={
                                  isSelected ? "white" : "rgb(249 115 22)"
                                }
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 12}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 12 }}
                                animate={{
                                  strokeDashoffset:
                                    2 * Math.PI * 12 * (1 - progress / 100),
                                }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {Math.round(progress)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Time Entries */}
              <motion.div variants={cardVariants} className="lg:col-span-2">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-dosis text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {format(selectedDate, "EEEE, MMMM dd")}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Timer className="w-4 h-4" />
                        <span className="font-dosis">
                          {selectedDayEntries.length}{" "}
                          {selectedDayEntries.length === 1
                            ? "entry"
                            : "entries"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {selectedDayEntries.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-12"
                        >
                          <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                          <h4 className="font-dosis text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No entries yet
                          </h4>
                          <p className="font-dosis text-gray-600 dark:text-gray-400 mb-4">
                            Start tracking your time for this day
                          </p>
                          <Button
                            onClick={() => setIsAddModalOpen(true)}
                            size="sm"
                            className="font-dosis bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Entry
                          </Button>
                        </motion.div>
                      ) : (
                        selectedDayEntries.map((entry, index) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                                    {entry.taskId
                                      ? "Task Entry"
                                      : "Manual Entry"}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-mono">
                                      {formatTime(entry.startTime)} -{" "}
                                      {entry.endTime
                                        ? formatTime(entry.endTime)
                                        : "ongoing"}
                                    </span>
                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 rounded-md font-dosis font-medium">
                                      {formatDuration(entry.duration)}
                                    </span>
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {entry.description && (
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
                                      <p className="font-dosis text-sm text-gray-600 dark:text-gray-400 mt-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                        {entry.description}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
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
                                  onClick={() => setEditingEntry(entry.id)}
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
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Weekly Summary */}
              <motion.div variants={cardVariants} className="space-y-6">
                {/* Weekly Stats Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-dosis text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Weekly Summary
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {/* Total Time */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                          Total Tracked
                        </span>
                        <span className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                          {formatDuration(weeklyStats.total)}
                        </span>
                      </div>
                    </div>

                    {/* Daily Average */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                          Daily Average
                        </span>
                        <span className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                          {formatDuration(weeklyStats.average)}
                        </span>
                      </div>
                    </div>

                    {/* Weekly Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                          Weekly Goal
                        </span>
                        <span className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                          {Math.round(weeklyStats.progress)}%
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"
                          variants={progressVariants}
                          initial="hidden"
                          animate="visible"
                          custom={weeklyStats.progress}
                        />
                      </div>
                      <p className="font-dosis text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatDuration(weeklyStats.total)} of{" "}
                        {currentWorkspace.weeklyGoals}h goal
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <h3 className="font-dosis text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="font-dosis w-full justify-start"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Time Entry
                    </Button>
                    <Button
                      variant="outline"
                      className="font-dosis w-full justify-start"
                      onClick={() => router.push("/dashboard")}
                    >
                      <Timer className="w-4 h-4 mr-2" />
                      Start Timer
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
