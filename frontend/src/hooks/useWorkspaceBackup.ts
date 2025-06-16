import { db, Task, TimeEntry, Workspace } from "@/lib/db";
import { useWorkspaceStore } from "@/store";
import { useCallback, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

export interface ExportData {
  workspace: Workspace;
  exportedAt: string;
  version: string;
}

export type ImportMode = "merge" | "overwrite";

export const useWorkspaceBackup = () => {
  const { currentWorkspace, createWorkspace, loadWorkspace } =
    useWorkspaceStore();
  const [lastExported, setLastExported] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load last export timestamp
  const loadLastExported = useCallback(() => {
    if (!currentWorkspace) return;
    const timestamp = localStorage.getItem(
      `taku-last-export-${currentWorkspace.id}`
    );
    setLastExported(timestamp);
  }, [currentWorkspace]);

  const exportWorkspace = useCallback(async () => {
    if (!currentWorkspace || isExporting) return;

    setIsExporting(true);
    try {
      const exportData: ExportData = {
        workspace: currentWorkspace,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `taku-workspace-${currentWorkspace.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save export timestamp
      const timestamp = new Date().toISOString();
      localStorage.setItem(
        `taku-last-export-${currentWorkspace.id}`,
        timestamp
      );
      setLastExported(timestamp);

      return true;
    } catch (error) {
      console.error("Failed to export workspace:", error);
      throw new Error("Failed to export workspace. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [currentWorkspace, isExporting]);

  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const validateImportFile = useCallback((file: File): boolean => {
    return file.type === "application/json";
  }, []);

  const processImport = useCallback(
    async (file: File, mode: ImportMode): Promise<string | void> => {
      if (!validateImportFile(file)) {
        throw new Error("Invalid file type. Please select a JSON file.");
      }

      setIsImporting(true);
      try {
        const text = await file.text();
        const importData: ExportData = JSON.parse(text);

        if (!importData.workspace || !importData.version) {
          throw new Error("Invalid workspace file format.");
        }

        // Validate workspace structure
        const workspace = importData.workspace;
        if (!workspace.name || !workspace.ownerName || !workspace.role) {
          throw new Error("Invalid workspace data. Missing required fields.");
        }

        if (mode === "overwrite" || !currentWorkspace) {
          // Create new workspace from imported data
          const newWorkspaceId = await createWorkspace({
            name: currentWorkspace
              ? `${workspace.name} (Imported)`
              : workspace.name,
            ownerName: workspace.ownerName,
            role: workspace.role,
            columns: workspace.columns || ["Todo", "In Progress", "Done"],
            weeklyGoals: workspace.weeklyGoals || 40,
            theme: workspace.theme || "system",
            settings: workspace.settings || {
              heatmap: true,
              mascot: true,
              autoBackup: false,
              compactMode: false,
            },
          });

          // Now import the tasks and time entries from the JSON
          if (workspace.tasks && workspace.tasks.length > 0) {
            // Clear any default seeded tasks first
            await db.tasks.where("workspaceId").equals(newWorkspaceId).delete();

            // Import tasks from JSON with new workspace ID and new UUIDs
            const importedTasks = workspace.tasks.map((task) => ({
              ...task,
              id: uuid(), // Generate new ID
              workspaceId: newWorkspaceId, // Use new workspace ID
              createdAt: task.createdAt || new Date().toISOString(),
              updatedAt: task.updatedAt || new Date().toISOString(),
              timeSpent: task.timeSpent || 0,
              isActive: false, // Reset active state
            }));

            // Add imported tasks to database
            await db.tasks.bulkAdd(importedTasks);

            // Import time entries if they exist
            if (workspace.timeEntries && workspace.timeEntries.length > 0) {
              // Create mapping from old task IDs to new task IDs
              const taskIdMapping = new Map();
              workspace.tasks.forEach((oldTask, index) => {
                taskIdMapping.set(oldTask.id, importedTasks[index].id);
              });

              const importedTimeEntries = workspace.timeEntries.map(
                (entry) => ({
                  ...entry,
                  id: uuid(), // Generate new ID
                  workspaceId: newWorkspaceId, // Use new workspace ID
                  taskId: taskIdMapping.get(entry.taskId) || entry.taskId, // Map to new task ID
                  createdAt: entry.createdAt || new Date().toISOString(),
                })
              );

              // Add imported time entries to database
              await db.timeEntries.bulkAdd(importedTimeEntries);
            }
          }

          // Load the workspace with all imported data
          await loadWorkspace(newWorkspaceId);
          return newWorkspaceId;
        } else {
          // Merge mode - add imported data to current workspace
          if (!currentWorkspace) {
            throw new Error("No current workspace for merge operation");
          }

          const mergedTasks: Task[] = [];
          const mergedTimeEntries: TimeEntry[] = [];

          // Import tasks with new IDs
          if (workspace.tasks && workspace.tasks.length > 0) {
            const importedTasks = workspace.tasks.map((task) => ({
              ...task,
              id: uuid(),
              workspaceId: currentWorkspace.id,
              title: `${task.title} (Imported)`,
              createdAt: task.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              timeSpent: task.timeSpent || 0,
              isActive: false,
            }));

            await db.tasks.bulkAdd(importedTasks);
            mergedTasks.push(...importedTasks);

            // Import time entries with new task mappings
            if (workspace.timeEntries && workspace.timeEntries.length > 0) {
              const taskIdMapping = new Map();
              workspace.tasks.forEach((oldTask, index) => {
                taskIdMapping.set(oldTask.id, importedTasks[index].id);
              });

              const importedTimeEntries = workspace.timeEntries
                .filter((entry) => taskIdMapping.has(entry.taskId))
                .map((entry) => ({
                  ...entry,
                  id: uuid(),
                  workspaceId: currentWorkspace.id,
                  taskId: taskIdMapping.get(entry.taskId)!,
                  createdAt: entry.createdAt || new Date().toISOString(),
                }));

              await db.timeEntries.bulkAdd(importedTimeEntries);
              mergedTimeEntries.push(...importedTimeEntries);
            }
          }

          // Reload current workspace to reflect merged data
          await loadWorkspace(currentWorkspace.id);
          return currentWorkspace.id;
        }
      } catch (error) {
        console.error("Failed to import workspace:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(
          "Failed to import workspace. Please check the file format."
        );
      } finally {
        setIsImporting(false);
      }
    },
    [createWorkspace, loadWorkspace, validateImportFile, currentWorkspace]
  );

  return {
    lastExported,
    isExporting,
    isImporting,
    fileInputRef,
    loadLastExported,
    exportWorkspace,
    triggerImport,
    processImport,
    validateImportFile,
  };
};
