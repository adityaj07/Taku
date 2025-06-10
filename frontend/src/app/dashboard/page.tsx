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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/store";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Timer,
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
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const taskVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const columnVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { currentWorkspace, isLoading, isHydrated } = useWorkspaceStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (isHydrated && !isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, isHydrated, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!isHydrated || isLoading || !currentWorkspace) {
    return (
      <div
        className={`${dosis.variable} min-h-screen flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="font-dosis text-gray-600 dark:text-gray-300">
            {!isHydrated ? "Initializing..." : "Loading your workspace..."}
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

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/50";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50";
      case "low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800/50";
    }
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

  // Generate heatmap data for this week
  const getHeatmapData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(
      today.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
    );

    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);

      // Mock data - in real app, this would come from timeEntries
      const hoursWorked = Math.random() * 4;
      const intensity = Math.min(hoursWorked / 3, 1);

      return {
        day,
        date,
        hours: hoursWorked,
        intensity,
      };
    });
  };

  const heatmapData = getHeatmapData();

  // Group tasks by column
  const tasksByColumn = currentWorkspace.columns.reduce((acc, column) => {
    acc[column] = currentWorkspace.tasks.filter(
      (task) => task.column === column
    );
    return acc;
  }, {} as Record<string, typeof currentWorkspace.tasks>);

  return (
    <div className={dosis.variable}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header with Breadcrumbs */}
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-2 px-6">
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
            </div>
          </header>

          {/* Main Content */}
          <motion.main
            className="flex-1 p-6 space-y-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Welcome Header */}
            <motion.div variants={cardVariants} className="space-y-4">
              <div className="space-y-2">
                <h1 className="font-dosis text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {getGreeting()}, {currentWorkspace.ownerName.split(" ")[0]} 👋
                </h1>
                <p className="font-dosis text-lg text-gray-600 dark:text-gray-400">
                  Here's how your week is looking.
                </p>
              </div>

              {/* Weekly Progress */}
              <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                      Weekly Goal Progress
                    </span>
                  </div>
                  <span className="font-dosis text-sm text-gray-500 dark:text-gray-400">
                    {(totalTimeThisWeek / 60).toFixed(1)} / {weeklyGoalHours}h
                  </span>
                </div>
                <Progress
                  value={weeklyProgressPercentage}
                  className="h-3 bg-gray-100 dark:bg-gray-700"
                />
              </div>
            </motion.div>

            {/* Heatmap */}
            <motion.div variants={cardVariants} className="space-y-4">
              <h2 className="font-dosis text-xl font-semibold text-gray-900 dark:text-gray-100">
                This Week
              </h2>
              <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4">
                  {heatmapData.map((data, index) => (
                    <motion.div
                      key={data.day}
                      variants={cardVariants}
                      className="flex-1 text-center group cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="space-y-2">
                        <p className="font-dosis text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {data.day}
                        </p>
                        <div
                          className={`w-full h-12 rounded-lg border transition-all duration-200 ${
                            data.intensity > 0.7
                              ? "bg-orange-200 border-orange-300 dark:bg-orange-900/60 dark:border-orange-700"
                              : data.intensity > 0.4
                              ? "bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800"
                              : data.intensity > 0.1
                              ? "bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900"
                              : "bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                          } group-hover:shadow-sm`}
                          title={`${data.hours.toFixed(1)}h tracked on ${
                            data.day
                          }`}
                        />
                        <p className="font-dosis text-xs text-gray-400 dark:text-gray-500">
                          {data.hours.toFixed(1)}h
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Kanban Columns */}
            <motion.div variants={cardVariants} className="space-y-6">
              <h2 className="font-dosis text-xl font-semibold text-gray-900 dark:text-gray-100">
                Your Tasks
              </h2>

              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-fit">
                  {currentWorkspace.columns.map((column, columnIndex) => {
                    const tasks = tasksByColumn[column] || [];
                    return (
                      <motion.div
                        key={column}
                        variants={columnVariants}
                        custom={columnIndex}
                        className="flex-shrink-0 w-80"
                      >
                        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm h-fit">
                          {/* Column Header */}
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                              {column}
                            </h3>
                            <span className="font-dosis text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                              {tasks.length}
                            </span>
                          </div>

                          {/* Tasks */}
                          <div className="space-y-3">
                            <AnimatePresence>
                              {tasks.length === 0 ? (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-center py-8"
                                >
                                  <p className="font-dosis text-sm text-gray-400 dark:text-gray-500">
                                    No tasks yet
                                  </p>
                                </motion.div>
                              ) : (
                                tasks.map((task, taskIndex) => (
                                  <motion.div
                                    key={task.id}
                                    variants={taskVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    custom={taskIndex}
                                    className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600/50 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between">
                                        <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
                                          {task.title}
                                        </h4>
                                        {task.isActive && (
                                          <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{
                                              duration: 2,
                                              repeat: Infinity,
                                            }}
                                            className="flex items-center gap-1 text-orange-500"
                                          >
                                            <Timer className="w-3 h-3" />
                                          </motion.div>
                                        )}
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <div
                                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-dosis font-medium border ${getPriorityStyles(
                                            task.priority
                                          )}`}
                                        >
                                          {getPriorityIcon(task.priority)}
                                          <span className="capitalize">
                                            {task.priority}
                                          </span>
                                        </div>

                                        {task.timeSpent > 0 && (
                                          <span className="font-dosis text-xs text-gray-500 dark:text-gray-400">
                                            {task.timeSpent}m
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.main>

          {/* Floating Action Button */}
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 1,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <motion.button
              className="font-dosis h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all duration-200 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
            </motion.button>
          </motion.div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
