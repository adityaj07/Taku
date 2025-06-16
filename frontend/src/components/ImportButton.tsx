"use client";

import { Button } from "@/components/ui/button";
import { ImportDialog } from "@/components/ImportDialog";
import { ImportMode, useWorkspaceBackup } from "@/hooks/useWorkspaceBackup";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ImportButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
  onSuccess?: (workspaceId?: string) => void;
  redirectOnSuccess?: boolean;
}

export function ImportButton({
  variant = "default",
  size = "default",
  className = "",
  showIcon = true,
  children,
  onSuccess,
  redirectOnSuccess = false,
}: ImportButtonProps) {
  const router = useRouter();
  const { fileInputRef, triggerImport, processImport, isImporting } =
    useWorkspaceBackup();

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setImportFile(file);
      setShowImportDialog(true);
    } else if (file) {
      toast.error("Please select a valid JSON file");
    }
    // Reset the input
    event.target.value = "";
  };

  const handleImportConfirm = async (mode: ImportMode) => {
    if (!importFile) return;

    try {
      const workspaceId = await processImport(importFile, mode);
      toast.success("Workspace imported successfully!");
      setShowImportDialog(false);
      setImportFile(null);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(typeof workspaceId === 'string' ? workspaceId : undefined);
      }

      // Redirect if requested
      if (redirectOnSuccess && workspaceId) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 300);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
      // Don't close dialog on error - user might want to try again
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!isImporting) {
      setShowImportDialog(open);
      if (!open) {
        setImportFile(null);
      }
    }
  };

  const handleClick = () => {
    triggerImport();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isImporting}
        variant={variant}
        size={size}
        className={`font-dosis ${className}`}
      >
        {isImporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          showIcon && <Upload className="w-4 h-4 mr-2" />
        )}
        {children || (isImporting ? "Importing..." : "Import Workspace")}
      </Button>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Import Dialog */}
      <ImportDialog
        open={showImportDialog}
        onOpenChange={handleDialogClose}
        fileName={importFile?.name}
        onConfirm={handleImportConfirm}
        isLoading={isImporting}
      />
    </>
  );
}
