"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Dosis } from "next/font/google";
import { useWorkspaceStore } from "@/store";

const dosis = Dosis({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
});

export default function DashboardPage() {
  const router = useRouter();
  const { currentWorkspace, isLoading } = useWorkspaceStore();

  useEffect(() => {
    if (!isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, router]);

  if (isLoading || !currentWorkspace) {
    return (
      <div
        className={`${dosis.variable} min-h-screen flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="font-dosis text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${dosis.variable} min-h-screen bg-gray-50 dark:bg-gray-900`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="mb-8">
          <h1 className="font-dosis text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to {currentWorkspace.name}! 🎉
          </h1>
          <p className="font-dosis text-gray-600 dark:text-gray-400">
            Hello {currentWorkspace.ownerName}, ready to be productive?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="font-dosis font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Your Role
            </h3>
            <p className="font-dosis text-gray-600 dark:text-gray-400">
              {currentWorkspace.role}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="font-dosis font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Tasks Ready
            </h3>
            <p className="font-dosis text-2xl font-bold text-orange-500">
              {currentWorkspace.tasks.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="font-dosis font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Weekly Goal
            </h3>
            <p className="font-dosis text-2xl font-bold text-green-500">
              {currentWorkspace.weeklyGoals}h
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="font-dosis font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Your Tasks
          </h3>
          <div className="space-y-3">
            {currentWorkspace.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                    {task.title}
                  </h4>
                  <p className="font-dosis text-sm text-gray-500 dark:text-gray-400">
                    {task.column} • {task.priority} priority
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-dosis font-medium ${
                    task.priority === "high"
                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      : task.priority === "medium"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  }`}
                >
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
