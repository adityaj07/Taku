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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkspaceStore } from "@/store";
import {
  addDays,
  format,
  isSameDay,
  isToday,
  startOfYear,
  subDays,
} from "date-fns";
import { motion } from "framer-motion";
import {
  Award,
  Calendar,
  Edit3,
  Flame,
  Save,
  Target,
  TrendingUp,
  Trophy,
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

interface HeatmapDay {
  date: Date;
  value: number;
  tasksCompleted: number;
  timeTracked: number;
}

export default function GoalsPage() {
  const router = useRouter();
  const { currentWorkspace, isLoading, isHydrated, updateWorkspaceSettings } =
    useWorkspaceStore();

  // State for goal editing
  const [editingWeeklyGoal, setEditingWeeklyGoal] = useState(false);
  const [weeklyGoalInput, setWeeklyGoalInput] = useState("");
  const [monthlyTaskGoal, setMonthlyTaskGoal] = useState(20);
  const [editingMonthlyGoal, setEditingMonthlyGoal] = useState(false);
  const [monthlyGoalInput, setMonthlyGoalInput] = useState("");

  useEffect(() => {
    if (isHydrated && !isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, isHydrated, router]);

  // Initialize goal inputs
  useEffect(() => {
    if (currentWorkspace) {
      setWeeklyGoalInput(currentWorkspace.weeklyGoals.toString());
      setMonthlyGoalInput(monthlyTaskGoal.toString());
    }
  }, [currentWorkspace, monthlyTaskGoal]);

  // Generate heatmap data for the past year
  const generateHeatmapData = (): HeatmapDay[] => {
    if (!currentWorkspace) return [];

    const data: HeatmapDay[] = [];
    const startDate = startOfYear(new Date());
    const endDate = new Date();

    for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
      const dayEntries = currentWorkspace.timeEntries.filter((entry) =>
        isSameDay(new Date(entry.startTime), d)
      );

      const timeTracked = dayEntries.reduce(
        (sum, entry) => sum + entry.duration,
        0
      );

      const tasksCompleted = currentWorkspace.tasks.filter(
        (task) =>
          task.column === "Done" &&
          task.updatedAt &&
          isSameDay(new Date(task.updatedAt), d)
      ).length;

      // Activity level (0-4) based on time tracked
      let value = 0;
      if (timeTracked > 0) value = 1;
      if (timeTracked >= 120) value = 2; // 2+ hours
      if (timeTracked >= 240) value = 3; // 4+ hours
      if (timeTracked >= 480) value = 4; // 8+ hours

      data.push({
        date: new Date(d),
        value,
        tasksCompleted,
        timeTracked,
      });
    }

    return data;
  };

  // Calculate current streak
  const calculateStreak = () => {
    if (!currentWorkspace) return { current: 0, longest: 0 };

    const heatmapData = generateHeatmapData();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from today backwards)
    const today = new Date();
    for (let i = 0; i <= 365; i++) {
      const checkDate = subDays(today, i);
      const dayData = heatmapData.find((d) => isSameDay(d.date, checkDate));

      if (dayData && dayData.value > 0) {
        if (i === 0 || currentStreak > 0) {
          currentStreak++;
        }
      } else if (i === 0) {
        break; // If today has no activity, current streak is 0
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (const day of heatmapData) {
      if (day.value > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { current: currentStreak, longest: longestStreak };
  };

  // Calculate weekly progress
  const getWeeklyProgress = () => {
    if (!currentWorkspace) return { current: 0, goal: 0, percentage: 0 };

    const weekStart = subDays(new Date(), 7);
    const weeklyMinutes = currentWorkspace.timeEntries
      .filter((entry) => new Date(entry.startTime) >= weekStart)
      .reduce((sum, entry) => sum + entry.duration, 0);

    const weeklyHours = weeklyMinutes / 60;
    const goal = currentWorkspace.weeklyGoals;
    const percentage = Math.min((weeklyHours / goal) * 100, 100);

    return { current: weeklyHours, goal, percentage };
  };

  // Calculate monthly task progress
  const getMonthlyTaskProgress = () => {
    if (!currentWorkspace)
      return { current: 0, goal: monthlyTaskGoal, percentage: 0 };

    const monthStart = subDays(new Date(), 30);
    const completedTasks = currentWorkspace.tasks.filter(
      (task) =>
        task.column === "Done" &&
        task.updatedAt &&
        new Date(task.updatedAt) >= monthStart
    ).length;

    const percentage = Math.min((completedTasks / monthlyTaskGoal) * 100, 100);

    return { current: completedTasks, goal: monthlyTaskGoal, percentage };
  };

  // Get activity level color
  const getActivityColor = (level: number) => {
    const colors = [
      "bg-gray-100 dark:bg-gray-800", // 0 - no activity
      "bg-orange-200 dark:bg-orange-900/40", // 1 - low
      "bg-orange-300 dark:bg-orange-800/60", // 2 - medium
      "bg-orange-400 dark:bg-orange-700/80", // 3 - high
      "bg-orange-500 dark:bg-orange-600", // 4 - very high
    ];
    return colors[level] || colors[0];
  };

  // Handle goal updates
  const handleWeeklyGoalSave = async () => {
    const newGoal = parseInt(weeklyGoalInput);
    if (!isNaN(newGoal) && newGoal > 0) {
      await updateWorkspaceSettings({ weeklyGoals: newGoal });
      setEditingWeeklyGoal(false);
    }
  };

  const handleMonthlyGoalSave = () => {
    const newGoal = parseInt(monthlyGoalInput);
    if (!isNaN(newGoal) && newGoal > 0) {
      setMonthlyTaskGoal(newGoal);
      setEditingMonthlyGoal(false);
    }
  };

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

  const heatmapData = generateHeatmapData();
  const streakData = calculateStreak();
  const weeklyProgress = getWeeklyProgress();
  const monthlyTaskProgress = getMonthlyTaskProgress();

  // Check if streak is at risk (no activity today)
  const todayActivity = heatmapData.find((d) => isToday(d.date));
  const streakAtRisk =
    streakData.current > 0 && (!todayActivity || todayActivity.value === 0);

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
                    Goals
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
            <TooltipProvider>
              <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="font-dosis text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      Goals
                    </h1>
                    <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                      Track your progress and build consistency
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Streak */}
                  <Card className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/50 rounded-lg flex items-center justify-center">
                            <motion.div
                              animate={
                                streakAtRisk
                                  ? { scale: [1, 1.1, 1] }
                                  : { rotate: [0, 5, -5, 5, 0] }
                              }
                              transition={{
                                duration: streakAtRisk ? 1 : 2,
                                repeat: Infinity,
                                repeatDelay: streakAtRisk ? 0 : 3,
                              }}
                            >
                              <Flame
                                className={`w-5 h-5 ${
                                  streakAtRisk
                                    ? "text-red-500"
                                    : "text-orange-600 dark:text-orange-400"
                                }`}
                              />
                            </motion.div>
                          </div>
                          <div>
                            <h3 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                              Current Streak
                            </h3>
                            <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                              Days in a row
                            </p>
                          </div>
                        </div>
                        {streakAtRisk && (
                          <span className="text-xs font-dosis font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30 px-2 py-1 rounded-full">
                            At Risk
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold font-dosis text-gray-900 dark:text-gray-100">
                            {streakData.current}
                          </span>
                          <span className="font-dosis text-gray-600 dark:text-gray-400">
                            {streakData.current === 1 ? "day" : "days"}
                          </span>
                        </div>
                        {streakData.longest > streakData.current && (
                          <p className="font-dosis text-sm text-gray-500 dark:text-gray-500">
                            Best: {streakData.longest} days
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weekly Goal */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-950/50 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div>
                            <h3 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                              Weekly Goal
                            </h3>
                            <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                              Hours tracked
                            </p>
                          </div>
                        </div>
                        {!editingWeeklyGoal ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingWeeklyGoal(true)}
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleWeeklyGoalSave}
                              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingWeeklyGoal(false);
                                setWeeklyGoalInput(
                                  currentWorkspace.weeklyGoals.toString()
                                );
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold font-dosis text-gray-900 dark:text-gray-100">
                            {weeklyProgress.current.toFixed(1)}h
                          </span>
                          <span className="font-dosis text-gray-600 dark:text-gray-400">
                            /
                            {editingWeeklyGoal ? (
                              <Input
                                value={weeklyGoalInput}
                                onChange={(e) =>
                                  setWeeklyGoalInput(e.target.value)
                                }
                                className="inline-flex w-16 h-6 text-sm p-1 mx-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleWeeklyGoalSave();
                                  if (e.key === "Escape") {
                                    setEditingWeeklyGoal(false);
                                    setWeeklyGoalInput(
                                      currentWorkspace.weeklyGoals.toString()
                                    );
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              ` ${weeklyProgress.goal}`
                            )}
                            h
                          </span>
                        </div>
                        <div className="space-y-2">
                          <Progress
                            value={weeklyProgress.percentage}
                            className="h-2"
                          />
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-dosis text-gray-600 dark:text-gray-400">
                              {Math.round(weeklyProgress.percentage)}% complete
                            </span>
                            {weeklyProgress.percentage >= 100 && (
                              <span className="font-dosis text-green-600 dark:text-green-400 flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                Goal reached!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Monthly Tasks */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/50 rounded-lg flex items-center justify-center">
                            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                              Monthly Tasks
                            </h3>
                            <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                              Tasks completed
                            </p>
                          </div>
                        </div>
                        {!editingMonthlyGoal ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMonthlyGoal(true)}
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleMonthlyGoalSave}
                              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingMonthlyGoal(false);
                                setMonthlyGoalInput(monthlyTaskGoal.toString());
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold font-dosis text-gray-900 dark:text-gray-100">
                            {monthlyTaskProgress.current}
                          </span>
                          <span className="font-dosis text-gray-600 dark:text-gray-400">
                            /
                            {editingMonthlyGoal ? (
                              <Input
                                value={monthlyGoalInput}
                                onChange={(e) =>
                                  setMonthlyGoalInput(e.target.value)
                                }
                                className="inline-flex w-16 h-6 text-sm p-1 mx-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleMonthlyGoalSave();
                                  if (e.key === "Escape") {
                                    setEditingMonthlyGoal(false);
                                    setMonthlyGoalInput(
                                      monthlyTaskGoal.toString()
                                    );
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              ` ${monthlyTaskProgress.goal}`
                            )}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <Progress
                            value={monthlyTaskProgress.percentage}
                            className="h-2"
                          />
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-dosis text-gray-600 dark:text-gray-400">
                              {Math.round(monthlyTaskProgress.percentage)}%
                              complete
                            </span>
                            {monthlyTaskProgress.percentage >= 100 && (
                              <span className="font-dosis text-green-600 dark:text-green-400 flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                Goal reached!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Activity Heatmap */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          <span className="font-dosis">Activity Overview</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Heatmap Grid */}
                          <div className="overflow-x-auto">
                            <div className="grid grid-cols-53 gap-1 min-w-[800px]">
                              {heatmapData.map((day, index) => (
                                <Tooltip key={index}>
                                  <TooltipTrigger asChild>
                                    <motion.div
                                      className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-orange-300 dark:hover:ring-orange-600 ${getActivityColor(
                                        day.value
                                      )}`}
                                      whileHover={{ scale: 1.2 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 400,
                                      }}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-center space-y-1">
                                      <p className="font-dosis font-semibold">
                                        {format(day.date, "MMM dd, yyyy")}
                                      </p>
                                      <p className="font-dosis text-sm">
                                        {Math.floor(day.timeTracked / 60)}h{" "}
                                        {day.timeTracked % 60}m tracked
                                      </p>
                                      <p className="font-dosis text-sm">
                                        {day.tasksCompleted} tasks completed
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-dosis text-gray-600 dark:text-gray-400">
                              <span>Less</span>
                              <div className="flex gap-1">
                                {[0, 1, 2, 3, 4].map((level) => (
                                  <div
                                    key={level}
                                    className={`w-3 h-3 rounded-sm ${getActivityColor(
                                      level
                                    )}`}
                                  />
                                ))}
                              </div>
                              <span>More</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="font-dosis">Statistics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                            Most productive day
                          </span>
                          <span className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                            {(() => {
                              const maxDay = heatmapData.reduce(
                                (max, day) =>
                                  day.timeTracked > max.timeTracked ? day : max,
                                heatmapData[0] || {
                                  date: new Date(),
                                  timeTracked: 0,
                                }
                              );
                              return format(maxDay.date, "MMM dd");
                            })()}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between py-2">
                          <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                            Average daily focus
                          </span>
                          <span className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                            {(() => {
                              const totalMinutes = heatmapData.reduce(
                                (sum, day) => sum + day.timeTracked,
                                0
                              );
                              const activeDays = heatmapData.filter(
                                (day) => day.timeTracked > 0
                              ).length;
                              const avgMinutes =
                                activeDays > 0 ? totalMinutes / activeDays : 0;
                              return `${Math.floor(
                                avgMinutes / 60
                              )}h ${Math.floor(avgMinutes % 60)}m`;
                            })()}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between py-2">
                          <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                            Tasks this month
                          </span>
                          <span className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                            {monthlyTaskProgress.current}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between py-2">
                          <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                            Active days this year
                          </span>
                          <span className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                            {heatmapData.filter((day) => day.value > 0).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TooltipProvider>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
