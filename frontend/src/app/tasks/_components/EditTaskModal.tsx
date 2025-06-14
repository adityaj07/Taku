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
import { Task } from "@/lib/db";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle, CalendarIcon, CheckCircle2, Circle } from "lucide-react";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  task: Task | null;
  onTaskChange: (task: Task | null) => void;
  isLoading: boolean;
}

export const EditTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  onTaskChange,
  isLoading,
}: EditTaskModalProps) => {
  const handleSubmit = async () => {
    await onSubmit();
    // Modal will close from parent component if successful
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-dosis">Edit Task</DialogTitle>
          <DialogDescription className="font-dosis">
            Update task details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="font-dosis text-sm font-medium mb-2 block">
              Task Title
            </label>
            <Input
              placeholder="Enter task title..."
              value={task.title}
              onChange={(e) =>
                onTaskChange(task ? { ...task, title: e.target.value } : null)
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
              value={task.description || ""}
              onChange={(e) =>
                onTaskChange(
                  task ? { ...task, description: e.target.value } : null
                )
              }
              className="font-dosis resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-dosis text-sm font-medium mb-2 block">
                Priority
              </label>
              <Select
                value={task.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  onTaskChange(task ? { ...task, priority: value } : null)
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
                      !task.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {task.dueDate
                      ? format(new Date(task.dueDate), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={task.dueDate ? new Date(task.dueDate) : undefined}
                    onSelect={(date) => {
                      onTaskChange(
                        task
                          ? {
                              ...task,
                              dueDate: date ? date.toISOString() : undefined,
                            }
                          : null
                      );
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
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
              disabled={!task.title.trim() || isLoading}
              className="font-dosis flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
