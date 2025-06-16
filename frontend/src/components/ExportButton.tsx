"use client";

import { Button } from "@/components/ui/button";
import { useWorkspaceBackup } from "@/hooks/useWorkspaceBackup";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function ExportButton({
  variant = "default",
  size = "default",
  className = "",
  showIcon = true,
  children,
}: ExportButtonProps) {
  const { exportWorkspace, isExporting } = useWorkspaceBackup();

  const handleExport = async () => {
    try {
      await exportWorkspace();
      toast.success("Workspace exported successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={`font-dosis ${className}`}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        showIcon && <Download className="w-4 h-4 mr-2" />
      )}
      {children || (isExporting ? "Exporting..." : "Export Workspace")}
    </Button>
  );
}
