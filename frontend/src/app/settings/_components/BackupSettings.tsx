"use client";

import { ExportButton } from "@/components/ExportButton";
import { ImportButton } from "@/components/ImportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkspaceBackup } from "@/hooks/useWorkspaceBackup";
import { AlertTriangle, FileText } from "lucide-react";
import { useEffect } from "react";

export function BackupSettings() {
  const { lastExported, loadLastExported } = useWorkspaceBackup();

  useEffect(() => {
    loadLastExported();
  }, [loadLastExported]);

  const handleImportSuccess = (workspaceId?: string) => {
    console.log("Workspace imported successfully:", workspaceId);
    // Refresh last exported timestamp since we might have a new workspace
    loadLastExported();
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-green-500" />
          <CardTitle className="font-dosis">Backup & Restore</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-dosis font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Export Workspace
              </h4>
              <p className="font-dosis text-sm text-gray-600 dark:text-gray-400 mb-3">
                Download your workspace data as a JSON file for backup or
                transfer.
              </p>
              <ExportButton className="bg-green-500 hover:bg-green-600 w-full" />
            </div>
            {lastExported && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-dosis">
                Last exported: {new Date(lastExported).toLocaleString()}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-dosis font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Import Workspace
              </h4>
              <p className="font-dosis text-sm text-gray-600 dark:text-gray-400 mb-3">
                Upload a JSON file to restore or create a new workspace.
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <ImportButton
                      variant="outline"
                      className="w-full"
                      onSuccess={handleImportSuccess}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-500" />
                    <span>Import workspace data from JSON backup file</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
