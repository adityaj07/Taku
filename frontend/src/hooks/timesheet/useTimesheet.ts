import { Task, TimeEntry } from "@/lib/db";
import { useWorkspaceStore } from "@/store";
import { getColumnColor } from "@/utils";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { useState } from "react";

interface EditingTimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  description: string;
}

export const useTimesheet = (selectedDate: Date) => {
  const { currentWorkspace, addTimeEntry, updateTimeEntry, deleteTimeEntry } =
    useWorkspaceStore();

  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
    new Set()
  );
  const [editingEntry, setEditingEntry] = useState<EditingTimeEntry | null>(
    null
  );

  // Utility functions
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

  // Data functions
  const getWeekDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

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

  // Action functions
  const toggleEntryExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const startEditingEntry = (entry: TimeEntry & { task?: Task }) => {
    setEditingEntry({
      id: entry.id,
      startTime: formatTimeInput(entry.startTime),
      endTime: entry.endTime ? formatTimeInput(entry.endTime) : "",
      description: entry.description || "",
    });
  };

  const handleAddTimeEntry = async (entryData: {
    taskId: string;
    startTime: string;
    endTime: string;
    description: string;
  }) => {
    const startTime = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${entryData.startTime}`
    );
    const endTime = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${entryData.endTime}`
    );
    const duration = Math.max(
      0,
      Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    );

    await addTimeEntry({
      taskId: entryData.taskId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      description: entryData.description,
    });
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

  const updateEditingEntry = (updates: Partial<EditingTimeEntry>) => {
    setEditingEntry((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return {
    // State
    expandedEntries,
    editingEntry,

    // Data
    selectedDayEntries: getSelectedDayEntries(),
    weeklyStats: getWeeklyStats(),

    // Utilities
    formatDuration,
    formatTime,
    getColumnColor,

    // Actions
    toggleEntryExpansion,
    startEditingEntry,
    handleAddTimeEntry,
    handleEditEntry,
    handleDeleteEntry,
    updateEditingEntry,
    setEditingEntry,
  };
};
