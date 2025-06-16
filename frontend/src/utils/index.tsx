import { AlertCircle, CheckCircle2, Circle } from "lucide-react";

export const getPriorityIcon = (priority: string) => {
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

export const getPriorityColor = (priority: string) => {
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

export const formatActiveTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const getColumnColor = (column: string) => {
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

export const getActivityColor = (level: number) => {
  const colors = [
    "bg-gray-100 dark:bg-gray-800", // 0 - no activity
    "bg-orange-200 dark:bg-orange-900/40", // 1 - low
    "bg-orange-300 dark:bg-orange-800/60", // 2 - medium
    "bg-orange-400 dark:bg-orange-700/80", // 3 - high
    "bg-orange-500 dark:bg-orange-600", // 4 - very high
  ];
  return colors[level] || colors[0];
};
