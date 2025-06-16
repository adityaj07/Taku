import { HeatmapDay } from "@/app/goals/page";
import { useWorkspaceStore } from "@/store";
import { addDays, isSameDay, startOfYear, subDays } from "date-fns";

export const useGoalsData = () => {
  const { currentWorkspace } = useWorkspaceStore();

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

      let value = 0;
      if (timeTracked > 0) value = 1;
      if (timeTracked >= 120) value = 2;
      if (timeTracked >= 240) value = 3;
      if (timeTracked >= 480) value = 4;

      data.push({
        date: new Date(d),
        value,
        tasksCompleted,
        timeTracked,
      });
    }

    return data;
  };

  const calculateStreak = () => {
    if (!currentWorkspace) return { current: 0, longest: 0 };

    const heatmapData = generateHeatmapData();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    for (let i = 0; i <= 365; i++) {
      const checkDate = subDays(today, i);
      const dayData = heatmapData.find((d) => isSameDay(d.date, checkDate));

      if (dayData && dayData.value > 0) {
        if (i === 0 || currentStreak > 0) {
          currentStreak++;
        }
      } else if (i === 0) {
        break;
      } else {
        break;
      }
    }

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

  const getMonthlyTaskProgress = (monthlyTaskGoal: number) => {
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

  return {
    generateHeatmapData,
    calculateStreak,
    getWeeklyProgress,
    getMonthlyTaskProgress,
  };
};
