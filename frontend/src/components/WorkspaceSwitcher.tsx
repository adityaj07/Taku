"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/store";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";

export function WorkspaceSwitcher() {
  const {
    currentWorkspace,
    availableWorkspaces,
    loadWorkspace,
    loadAllWorkspaces,
    deleteWorkspace,
  } = useWorkspaceStore();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAllWorkspaces();
  }, [loadAllWorkspaces]);

  const handleWorkspaceSwitch = async (workspaceId: string) => {
    if (workspaceId === currentWorkspace?.id) return;

    try {
      await loadWorkspace(workspaceId);
      toast.success("Workspace switched successfully");
    } catch (_error) {
      void _error;
      toast.error("Failed to switch workspace");
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!confirmDelete) return;
    if (availableWorkspaces.length <= 1) {
      toast.error("Cannot delete the last workspace");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWorkspace(confirmDelete.id);
      toast.success("Workspace deleted successfully");

      // If we deleted the current workspace, switch to another one
      if (
        confirmDelete.id === currentWorkspace?.id &&
        availableWorkspaces.length > 0
      ) {
        const remainingWorkspace = availableWorkspaces.find(
          (w) => w.id !== confirmDelete.id
        );
        if (remainingWorkspace) {
          await loadWorkspace(remainingWorkspace.id);
        } else {
          router.push("/");
        }
      }
    } catch (_error) {
      void _error;
      toast.error("Failed to delete workspace");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleCreateNew = () => {
    router.push("/");
  };

  if (!currentWorkspace) return null;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {currentWorkspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium font-dosis">
                    {currentWorkspace.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground font-dosis">
                    {currentWorkspace.ownerName} • {currentWorkspace.role}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <DropdownMenuLabel className="font-dosis text-xs text-muted-foreground">
                Workspaces ({availableWorkspaces.length})
              </DropdownMenuLabel>
              {availableWorkspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  className="gap-2 p-2 cursor-pointer"
                  onClick={() => handleWorkspaceSwitch(workspace.id)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded flex items-center justify-center text-white font-bold text-xs">
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-dosis font-medium text-sm">
                        {workspace.name}
                      </span>
                      <span className="font-dosis text-xs text-muted-foreground">
                        {workspace.ownerName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {workspace.id === currentWorkspace?.id && (
                      <Check className="size-4 text-green-600" />
                    )}
                    {availableWorkspaces.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete({
                            id: workspace.id,
                            name: workspace.name,
                          });
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="size-3 text-red-500" />
                      </button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2 cursor-pointer"
                onClick={handleCreateNew}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <span className="font-dosis font-medium">
                  Create New Workspace
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Workspace"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
        isLoading={isDeleting}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteWorkspace}
      />
    </>
  );
}
