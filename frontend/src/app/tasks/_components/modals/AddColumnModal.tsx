import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  columnName: string;
  onColumnNameChange: (name: string) => void;
  isLoading?: boolean;
}

export const AddColumnModal = ({
  isOpen,
  onClose,
  onSubmit,
  columnName,
  onColumnNameChange,
  isLoading = false,
}: AddColumnModalProps) => {
  const handleSubmit = async () => {
    await onSubmit();
    // Modal will close from parent component if successful
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && columnName.trim()) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-dosis">Add New Column</DialogTitle>
          <DialogDescription className="font-dosis">
            Create a new column for organizing your tasks
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="font-dosis text-sm font-medium mb-2 block">
              Column Name
            </label>
            <Input
              placeholder="e.g., Review, Testing, Blocked"
              value={columnName}
              onChange={(e) => onColumnNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="font-dosis"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="font-dosis flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!columnName.trim() || isLoading}
              className="font-dosis flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? "Adding..." : "Add Column"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
