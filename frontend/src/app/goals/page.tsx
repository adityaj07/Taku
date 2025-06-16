"use client";

import { AppSidebar } from "@/components/app-sidebar";
import HeaderBreadcrumb from "@/components/HeaderBreadcrumb";
import Loading from "@/components/Loading";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGoalsData } from "@/hooks/goals/useGoalsData";
import { useWorkspaceStore } from "@/store";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ActivityHeatmap from "./_components/ActivityHeatmap";
import { QuickStats } from "./_components/QuickStats";
import { StatsGrid } from "./_components/StatsGrid";

const dosis = Dosis({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
});

export interface HeatmapDay {
  date: Date;
  value: number;
  tasksCompleted: number;
  timeTracked: number;
}

export default function GoalsPage() {
  const router = useRouter();
  const { currentWorkspace, isLoading, isHydrated, updateWorkspaceSettings } =
    useWorkspaceStore();

  const [monthlyTaskGoal, setMonthlyTaskGoal] = useState(20);

  const {
    generateHeatmapData,
    calculateStreak,
    getWeeklyProgress,
    getMonthlyTaskProgress,
  } = useGoalsData();

  useEffect(() => {
    if (isHydrated && !isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, isHydrated, router]);

  const handleWeeklyGoalSave = async (newGoal: number) => {
    await updateWorkspaceSettings({ weeklyGoals: newGoal });
  };

  const handleMonthlyGoalSave = (newGoal: number) => {
    setMonthlyTaskGoal(newGoal);
  };

  if (!isHydrated || isLoading || !currentWorkspace) {
    return <Loading />;
  }

  const heatmapData = generateHeatmapData();
  const streakData = calculateStreak();
  const weeklyProgress = getWeeklyProgress();
  const monthlyTaskProgress = getMonthlyTaskProgress(monthlyTaskGoal);

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
            <HeaderBreadcrumb
              currentWorkspace={currentWorkspace}
              currentPageName={"Goals"}
            />
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
                <StatsGrid
                  streakData={streakData}
                  weeklyProgress={weeklyProgress}
                  monthlyTaskProgress={monthlyTaskProgress}
                  heatmapData={heatmapData}
                  onWeeklyGoalUpdate={handleWeeklyGoalSave}
                  onMonthlyGoalUpdate={handleMonthlyGoalSave}
                />

                {/* Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ActivityHeatmap heatmapData={heatmapData} />
                  <QuickStats
                    heatmapData={heatmapData}
                    monthlyTasksCount={monthlyTaskProgress.current}
                  />
                </div>
              </div>
            </TooltipProvider>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
