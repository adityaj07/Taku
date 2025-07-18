"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImportMode } from "@/hooks/useWorkspaceBackup";
import { useWorkspaceStore } from "@/store";
import { AlertTriangle, FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName?: string;
  onConfirm: (mode: ImportMode) => Promise<void>;
  isLoading?: boolean;
}

export function ImportDialog({
  open,
  onOpenChange,
  fileName,
  onConfirm,
  isLoading = false,
}: ImportDialogProps) {
  const { currentWorkspace, availableWorkspaces } = useWorkspaceStore();
  const [importMode, setImportMode] = useState<ImportMode>("overwrite");

  // Set default import mode based on whether there's a current workspace
  useEffect(() => {
    if (open) {
      setImportMode(currentWorkspace ? "overwrite" : "overwrite");
    }
  }, [open, currentWorkspace]);

  const handleConfirm = async () => {
    try {
      await onConfirm(importMode);
    } catch (error) {
      console.error("Import failed:", error);
      // Don't close dialog if import fails - let parent handle error state
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-dosis flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div>Import Workspace</div>
              <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Restore your data from backup
              </div>
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription className="font-dosis space-y-4 pt-2">
            <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-orange-800 dark:text-orange-200 text-sm">
                <strong>Selected file:</strong> {fileName || "No file selected"}
              </p>
            </div>

            <div className="space-y-3">
              <Label className="font-dosis font-medium text-base">
                Import Options:
              </Label>
              <Select
                value={importMode}
                onValueChange={(value: ImportMode) => setImportMode(value)}
                disabled={isLoading}
              >
                <SelectTrigger className="font-dosis">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overwrite">
                    <div className="space-y-1">
                      <div className="font-medium">Create New Workspace</div>
                      <div className="text-xs text-gray-500">
                        {currentWorkspace
                          ? `Creates a new workspace alongside your existing ${
                              availableWorkspaces.length
                            } workspace${
                              availableWorkspaces.length !== 1 ? "s" : ""
                            }`
                          : "Create workspace from imported data"}
                      </div>
                    </div>
                  </SelectItem>
                  {currentWorkspace && (
                    <SelectItem value="merge">
                      <div className="space-y-1">
                        <div className="font-medium">Merge with Current</div>
                        <div className="text-xs text-gray-500">
                          Add imported tasks to &quot;{currentWorkspace.name}
                          &quot;
                        </div>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Context-specific warnings */}
            {currentWorkspace && importMode === "overwrite" ? (
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    This will create a new workspace and switch to it. Your
                    current workspace{" "}
                    <strong>&quot;{currentWorkspace.name}&quot;</strong> will
                    remain unchanged and you can switch back anytime.
                  </p>
                </div>
              </div>
            ) : currentWorkspace && importMode === "merge" ? (
              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-800 dark:text-orange-200 text-sm">
                    This will add imported tasks to your current workspace.
                    Tasks will be renamed to avoid conflicts.
                  </p>
                </div>
              </div>
            ) : !currentWorkspace ? (
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  <strong>Welcome!</strong> This will create your workspace from
                  the imported data.
                </p>
              </div>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-dosis" disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="font-dosis bg-orange-600 hover:bg-orange-700"
            disabled={isLoading}
          >
            {isLoading
              ? "Importing..."
              : importMode === "merge"
              ? "Merge Data"
              : "Create Workspace"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
