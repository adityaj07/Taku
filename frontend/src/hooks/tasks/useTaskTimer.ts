"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/store";
import { formatActiveTime } from "@/utils";

export const useTaskTimer = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentWorkspace?.tasks) {
        const newActiveTimers: Record<string, number> = {};
        currentWorkspace.tasks.forEach((task) => {
          if (task.isActive && task.startTime) {
            const elapsed = Math.floor(
              (Date.now() - new Date(task.startTime).getTime()) / 1000
            );
            newActiveTimers[task.id] = elapsed;
          }
        });
        setActiveTimers(newActiveTimers);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentWorkspace?.tasks]);

  return {
    activeTimers,
    formatActiveTime,
  };
};
