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
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/store";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Circle,
  Clock,
  Target,
  User,
} from "lucide-react";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

const taskVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { currentWorkspace, isLoading, isHydrated } = useWorkspaceStore();

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
            {!isHydrated ? "Initializing..." : "Loading your workspace..."}
          </p>
        </div>
      </div>
    );
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      case "medium":
        return <Circle className="w-4 h-4" />;
      case "low":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const getColumnStyles = (column: string) => {
    switch (column) {
      case "Todo":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case "In Progress":
        return "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300";
      case "Done":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

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
            className="flex-1 p-6 space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Welcome Section */}
            <motion.div variants={cardVariants} className="space-y-2">
              <h1 className="font-dosis text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back, {currentWorkspace.ownerName}! 👋
              </h1>
              <p className="font-dosis text-lg text-gray-600 dark:text-gray-400">
                Ready to tackle your tasks and achieve your goals?
              </p>
            </motion.div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Role Card */}
              <motion.div
                variants={cardVariants}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                      Your Role
                    </h3>
                    <p className="font-dosis text-sm text-gray-500 dark:text-gray-400">
                      Current focus
                    </p>
                  </div>
                </div>
                <p className="font-dosis text-xl font-bold text-blue-600 dark:text-blue-400">
                  {currentWorkspace.role}
                </p>
              </motion.div>

              {/* Tasks Count Card */}
              <motion.div
                variants={cardVariants}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                      Total Tasks
                    </h3>
                    <p className="font-dosis text-sm text-gray-500 dark:text-gray-400">
                      Ready to work on
                    </p>
                  </div>
                </div>
                <p className="font-dosis text-xl font-bold text-orange-600 dark:text-orange-400">
                  {currentWorkspace.tasks.length}
                </p>
              </motion.div>

              {/* Weekly Goal Card */}
              <motion.div
                variants={cardVariants}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                      Weekly Goal
                    </h3>
                    <p className="font-dosis text-sm text-gray-500 dark:text-gray-400">
                      Hours target
                    </p>
                  </div>
                </div>
                <p className="font-dosis text-xl font-bold text-green-600 dark:text-green-400">
                  {currentWorkspace.weeklyGoals}h
                </p>
              </motion.div>
            </div>

            {/* Tasks Section */}
            <motion.div variants={cardVariants} className="space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <h2 className="font-dosis text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Your Tasks
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {currentWorkspace.tasks.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckSquare className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="font-dosis text-gray-500 dark:text-gray-400">
                      No tasks yet. Start by creating your first task!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentWorkspace.tasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        variants={taskVariants}
                        custom={index}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100 truncate">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-dosis font-medium ${getColumnStyles(
                                  task.column
                                )}`}
                              >
                                {task.column}
                              </span>
                              <span className="text-gray-300 dark:text-gray-600">
                                •
                              </span>
                              <span className="font-dosis text-sm text-gray-500 dark:text-gray-400">
                                {task.timeSpent > 0
                                  ? `${task.timeSpent}m tracked`
                                  : "Not started"}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-dosis font-medium border ${getPriorityStyles(
                              task.priority
                            )}`}
                          >
                            {getPriorityIcon(task.priority)}
                            <span className="capitalize">{task.priority}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
