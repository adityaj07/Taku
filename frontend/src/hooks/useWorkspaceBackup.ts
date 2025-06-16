import { Workspace } from "@/lib/db";
import { useWorkspaceStore } from "@/store";
import { useCallback, useRef, useState } from "react";

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

          // Load the new workspace to make it current
          await loadWorkspace(newWorkspaceId);
          return newWorkspaceId;
        } else {
          // TODO: Implement merge logic
          // For now, we'll create a new workspace even in merge mode
          const newWorkspaceId = await createWorkspace({
            name: `${workspace.name} (Merged)`,
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

          return newWorkspaceId;
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
