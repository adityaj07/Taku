import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle, CalendarIcon, CheckCircle2, Circle } from "lucide-react";

interface NewTaskForm {
  title: string;
  description: string;
  column: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  formData: NewTaskForm;
  onFormChange: (data: NewTaskForm) => void;
  columns: string[];
  isLoading: boolean;
}

export const AddTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  columns,
  isLoading,
}: AddTaskModalProps) => {
  const handleSubmit = async () => {
    await onSubmit();
    // Modal will close from parent component if successful
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-dosis">Create New Task</DialogTitle>
          <DialogDescription className="font-dosis">
            Add a new task to your workspace
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="font-dosis text-sm font-medium mb-2 block">
              Task Title
            </label>
            <Input
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) =>
                onFormChange({ ...formData, title: e.target.value })
              }
              className="font-dosis"
            />
          </div>

          <div>
            <label className="font-dosis text-sm font-medium mb-2 block">
              Description (Optional)
            </label>
            <Textarea
              placeholder="Add task description..."
              value={formData.description}
              onChange={(e) =>
                onFormChange({ ...formData, description: e.target.value })
              }
              className="font-dosis resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-dosis text-sm font-medium mb-2 block">
                Column
              </label>
              <Select
                value={formData.column}
                onValueChange={(value) =>
                  onFormChange({ ...formData, column: value })
                }
              >
                <SelectTrigger className="font-dosis">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-dosis text-sm font-medium mb-2 block">
                Priority
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  onFormChange({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="font-dosis">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Circle className="w-3 h-3 text-amber-600" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="font-dosis text-sm font-medium mb-2 block">
              Due Date (Optional)
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-dosis",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate
                    ? format(new Date(formData.dueDate), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formData.dueDate ? new Date(formData.dueDate) : undefined
                  }
                  onSelect={(date) => {
                    onFormChange({
                      ...formData,
                      dueDate: date ? date.toISOString() : "",
                    });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
              disabled={!formData.title.trim() || isLoading}
              className="font-dosis flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
