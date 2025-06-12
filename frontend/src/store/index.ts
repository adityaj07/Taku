import { db, Task, TimeEntry, Workspace } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  createWorkspace: (
    workspaceData: Omit<Workspace, "id" | "createdAt" | "tasks" | "timeEntries">
  ) => Promise<string>;
  loadWorkspace: (workspaceId: string) => Promise<void>;
  updateWorkspaceSettings: (
    settings: Partial<Workspace["settings"]> & {
      columns?: string[];
      weeklyGoals?: number;
    }
  ) => Promise<void>;
  setTheme: (theme: Workspace["theme"]) => Promise<void>;
  setHydrated: () => void;

  // Task actions
  addTask: (
    task: Omit<
      Task,
      | "id"
      | "workspaceId"
      | "createdAt"
      | "updatedAt"
      | "timeSpent"
      | "isActive"
    >
  ) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newColumn: string) => Promise<void>;
  reorderTasks: (columnId: string, taskIds: string[]) => Promise<void>;
  startTimer: (taskId: string) => Promise<void>;
  stopTimer: (taskId: string) => Promise<void>;

  // Time entry actions
  addTimeEntry: (
    entry: Omit<TimeEntry, "id" | "workspaceId" | "createdAt">
  ) => Promise<void>;
  updateTimeEntry: (
    entryId: string,
    updates: Partial<TimeEntry>
  ) => Promise<void>;
  deleteTimeEntry: (entryId: string) => Promise<void>;
}

const getSeededTasks = (
  role: Workspace["role"]
): Omit<
  Task,
  "id" | "workspaceId" | "createdAt" | "updatedAt" | "timeSpent" | "isActive"
>[] => {
  const baseProps = {
    description: "",
    timeSpent: 0,
    isActive: false,
  };

  switch (role) {
    case "Student":
      return [
        {
          ...baseProps,
          title: "Complete Assignment 2",
          column: "Todo",
          priority: "high",
        },
        {
          ...baseProps,
          title: "Revise Algorithms",
          column: "Todo",
          priority: "medium",
        },
        {
          ...baseProps,
          title: "Prepare notes for class",
          column: "Todo",
          priority: "medium",
        },
      ];
    case "Developer":
      return [
        {
          ...baseProps,
          title: "Fix bug in login API",
          column: "Todo",
          priority: "high",
        },
        {
          ...baseProps,
          title: "Add dark mode support",
          column: "In Progress",
          priority: "medium",
        },
        {
          ...baseProps,
          title: "Refactor Kanban logic",
          column: "Todo",
          priority: "medium",
        },
      ];
    case "Designer":
      return [
        {
          ...baseProps,
          title: "Design onboarding UI",
          column: "Todo",
          priority: "high",
        },
        {
          ...baseProps,
          title: "Polish mascot illustrations",
          column: "In Progress",
          priority: "medium",
        },
        {
          ...baseProps,
          title: "Update dashboard visuals",
          column: "Todo",
          priority: "medium",
        },
      ];
    default:
      return [
        {
          ...baseProps,
          title: "Plan tasks for the week",
          column: "Todo",
          priority: "medium",
        },
        {
          ...baseProps,
          title: "Read productivity tips",
          column: "Todo",
          priority: "low",
        },
        {
          ...baseProps,
          title: "Track daily focus time",
          column: "Todo",
          priority: "medium",
        },
      ];
  }
};

export const useWorkspaceStore = create<WorkspaceState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        currentWorkspace: null,
        isLoading: false,
        isHydrated: false,

        setHydrated: () => set({ isHydrated: true }),

        createWorkspace: async (workspaceData) => {
          set({ isLoading: true });

          const workspaceId = uuid();
          const now = new Date().toISOString();

          const seededTaskData = getSeededTasks(workspaceData.role);
          const tasks: Task[] = seededTaskData.map((taskData) => ({
            ...taskData,
            id: uuid(),
            workspaceId,
            createdAt: now,
            updatedAt: now,
            timeSpent: 0,
            isActive: false,
          }));

          const workspace: Workspace = {
            ...workspaceData,
            id: workspaceId,
            createdAt: now,
            tasks,
            timeEntries: [],
          };

          try {
            await db.workspaces.add(workspace);

            // Add tasks to tasks table
            await db.tasks.bulkAdd(tasks);

            set({ currentWorkspace: workspace, isLoading: false });
            return workspaceId;
          } catch (error) {
            console.error("Failed to create workspace:", error);
            set({ isLoading: false });
            throw error;
          }
        },

        loadWorkspace: async (workspaceId) => {
          set({ isLoading: true });

          try {
            const workspace = await db.workspaces.get(workspaceId);
            if (!workspace) {
              throw new Error("Workspace not found");
            }

            const tasks = await db.tasks
              .where("workspaceId")
              .equals(workspaceId)
              .toArray();
            const timeEntries = await db.timeEntries
              .where("workspaceId")
              .equals(workspaceId)
              .toArray();

            const fullWorkspace: Workspace = {
              ...workspace,
              tasks,
              timeEntries,
            };

            set({ currentWorkspace: fullWorkspace, isLoading: false });
          } catch (error) {
            console.error("Failed to load workspace:", error);
            set({ isLoading: false });
            throw error;
          }
        },

        updateWorkspaceSettings: async (settings) => {
          const { currentWorkspace } = get();
          if (!currentWorkspace) return;

          // Separate columns and weeklyGoals from other settings
          const { weeklyGoals, columns, ...otherSettings } = settings;

          let updateData: any = {};

          // Handle settings object updates
          if (Object.keys(otherSettings).length > 0) {
            const updatedSettings = {
              ...currentWorkspace.settings,
              ...otherSettings,
            };
            updateData.settings = updatedSettings;
          }

          // Handle weeklyGoals separately
          if (weeklyGoals !== undefined) {
            updateData.weeklyGoals = weeklyGoals;
          }

          // Handle columns separately
          if (columns !== undefined) {
            updateData.columns = columns;
          }

          const updatedWorkspace = { ...currentWorkspace, ...updateData };

          try {
            await db.workspaces.update(currentWorkspace.id, updateData);
            set({ currentWorkspace: updatedWorkspace });
          } catch (error) {
            console.error("Failed to update workspace settings:", error);
          }
        },

        setTheme: async (theme) => {
          const { currentWorkspace } = get();
          if (!currentWorkspace) return;

          const updatedWorkspace = { ...currentWorkspace, theme };

          try {
            await db.workspaces.update(currentWorkspace.id, { theme });
            set({ currentWorkspace: updatedWorkspace });
          } catch (error) {
            console.error("Failed to update theme:", error);
          }
        },

        addTask: async (taskData) => {
          const { currentWorkspace } = get();
          if (!currentWorkspace) return;

          const now = new Date().toISOString();
          const task: Task = {
            ...taskData,
            id: uuid(),
            workspaceId: currentWorkspace.id,
            createdAt: now,
            updatedAt: now,
            timeSpent: 0,
            isActive: false,
          };

          try {
            await db.tasks.add(task);

            const updatedTasks = [...currentWorkspace.tasks, task];
            set({
              currentWorkspace: {
                ...currentWorkspace,
                tasks: updatedTasks,
              },
            });
          } catch (error) {
            console.error("Failed to add task:", error);
          }
        },

        updateTask: async (taskId, updates) => {
          const { currentWorkspace } = get();
          if (!currentWorkspace) return;

          const updatedAt = new Date().toISOString();
          const taskUpdates = { ...updates, updatedAt };

          try {
            await db.tasks.update(taskId, taskUpdates);

            const updatedTasks = currentWorkspace.tasks.map((task) =>
              task.id === taskId ? { ...task, ...taskUpdates } : task
            );

            set({
              currentWorkspace: {
                ...currentWorkspace,
                tasks: updatedTasks,
              },
            });
          } catch (error) {
            console.error("Failed to update task:", error);
          }
        },

        deleteTask: async (taskId) => {
          const { currentWorkspace } = get();
          if (!currentWorkspace) return;

          try {
            await db.tasks.delete(taskId);
            await db.timeEntries.where("taskId").equals(taskId).delete();

            const updatedTasks = currentWorkspace.tasks.filter(
              (task) => task.id !== taskId
            );
            const updatedTimeEntries = currentWorkspace.timeEntries.filter(
              (entry) => entry.taskId !== taskId
            );

            set({
              currentWorkspace: {
                ...currentWorkspace,
                tasks: updatedTasks,
                timeEntries: updatedTimeEntries,
              },
            });
          } catch (error) {
            console.error("Failed to delete task:", error);
          }
        },

        moveTask: async (taskId, newColumn) => {
          const { updateTask } = get();
          await updateTask(taskId, { column: newColumn });
        },

        reorderTasks: async (columnId, taskIds) => {
          //TODO: This would require updating the Task schema to include an order field
          // For now, we'll keep it simple and not implement reordering within columns
          console.log("Reordering tasks:", columnId, taskIds);
        },

        startTimer: async (taskId) => {
          const { currentWorkspace, updateTask } = get();
          if (!currentWorkspace) return;

          // Stop any other active timers
          const activeTasks = currentWorkspace.tasks.filter(
            (task) => task.isActive && task.id !== taskId
          );
          for (const task of activeTasks) {
            await updateTask(task.id, {
              isActive: false,
              startTime: undefined,
            });
          }

          // Start timer for this task
          await updateTask(taskId, {
            isActive: true,
            startTime: new Date().toISOString(),
          });
        },

        stopTimer: async (taskId) => {
          const { currentWorkspace, updateTask, addTimeEntry } = get();
          if (!currentWorkspace) return;

          const task = currentWorkspace.tasks.find((t) => t.id === taskId);
          if (!task || !task.isActive || !task.startTime) return;

          const endTime = new Date().toISOString();
          const startTime = new Date(task.startTime);
          const duration = Math.round(
            (new Date(endTime).getTime() - startTime.getTime()) / (1000 * 60)
          );

          // Update task
          await updateTask(taskId, {
            isActive: false,
            timeSpent: task.timeSpent + duration,
            startTime: undefined,
          });

          // Add time entry
          await addTimeEntry({
            taskId,
            startTime: task.startTime,
            endTime,
            duration,
            description: `Worked on ${task.title}`,
          });
        },

        addTimeEntry: async (entryData) => {
          const { currentWorkspace } = get();
          if (!currentWorkspace) return;

          const timeEntry: TimeEntry = {
            ...entryData,
            id: uuid(),
            workspaceId: currentWorkspace.id,
            createdAt: new Date().toISOString(),
          };

          try {
            await db.timeEntries.add(timeEntry);

            const updatedTimeEntries = [
              ...currentWorkspace.timeEntries,
              timeEntry,
            ];
            set({
              currentWorkspace: {
                ...currentWorkspace,
                timeEntries: updatedTimeEntries,
              },
            });
          } catch (error) {
            console.error("Failed to add time entry:", error);
          }
        },

        updateTimeEntry: async (entryId, updates) => {
          const { currentWorkspace } = get();
          if (!currentWorkspace) return;

          try {
            await db.timeEntries.update(entryId, updates);

            const updatedTimeEntries = currentWorkspace.timeEntries.map(
              (entry) =>
                entry.id === entryId ? { ...entry, ...updates } : entry
            );

            set({
              currentWorkspace: {
                ...currentWorkspace,
                timeEntries: updatedTimeEntries,
              },
            });
          } catch (error) {
            console.error("Failed to update time entry:", error);
          }
        },

        deleteTimeEntry: async (entryId) => {
          const { currentWorkspace } = get();
          if (!currentWorkspace) return;

          try {
            await db.timeEntries.delete(entryId);

            const updatedTimeEntries = currentWorkspace.timeEntries.filter(
              (entry) => entry.id !== entryId
            );
            set({
              currentWorkspace: {
                ...currentWorkspace,
                timeEntries: updatedTimeEntries,
              },
            });
          } catch (error) {
            console.error("Failed to delete time entry:", error);
          }
        },
      }),
      {
        name: "taku-workspace",
        partialize: (state) => ({
          currentWorkspace: state.currentWorkspace,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated();
        },
      }
    )
  )
);
