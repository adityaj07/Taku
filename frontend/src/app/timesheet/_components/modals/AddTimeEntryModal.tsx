"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Workspace } from "@/lib/db";
import { cn } from "@/lib/utils";
import { getColumnColor } from "@/utils";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface TimeEntryForm {
  taskId: string;
  taskTitle: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface AddTimeEntryModalProps {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
  onAddEntry: (
    entry: Omit<TimeEntryForm, "taskTitle"> & { taskId: string }
  ) => Promise<void>;
  selectedDate: Date;
  currentWorkspace: Workspace;
}

const AddTimeEntryModal: FC<AddTimeEntryModalProps> = ({
  isOpen,
  onClose,
  onAddEntry,
  selectedDate,
  currentWorkspace,
}) => {
  const [form, setForm] = useState<TimeEntryForm>({
    taskId: "",
    taskTitle: "",
    startTime: "",
    endTime: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setForm({
        taskId: "",
        taskTitle: "",
        startTime: "",
        endTime: "",
        description: "",
      });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!form.startTime || !form.endTime) return;
    if (!form.taskId && !form.taskTitle) return;

    setIsSubmitting(true);

    try {
      // If custom task title is provided, create a temporary taskId
      const finalTaskId = form.taskId || form.taskTitle;

      await onAddEntry({
        taskId: finalTaskId,
        startTime: form.startTime,
        endTime: form.endTime,
        description: form.description,
      });

      onClose(false);
    } catch (error) {
      console.error("Failed to add time entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskSelect = (value: string) => {
    const task = currentWorkspace.tasks.find((t) => t.id === value);
    setForm((prev) => ({
      ...prev,
      taskId: value,
      taskTitle: task ? task.title : "",
    }));
  };

  const isFormValid =
    form.startTime && form.endTime && (form.taskId || form.taskTitle);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-dosis">Add Time Entry</DialogTitle>
          <DialogDescription className="font-dosis">
            Create a new time entry for {format(selectedDate, "MMMM dd, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-dosis text-sm font-medium">Task</label>
            <div className="space-y-2">
              <Select value={form.taskId} onValueChange={handleTaskSelect}>
                <SelectTrigger className="font-dosis">
                  <SelectValue placeholder="Select existing task" />
                </SelectTrigger>
                <SelectContent>
                  {currentWorkspace.tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-md text-xs border",
                            getColumnColor(task.column)
                          )}
                        >
                          {task.column}
                        </span>
                        <span>{task.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                or
              </div>

              <Input
                placeholder="Enter custom task name"
                value={form.taskTitle}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    taskTitle: e.target.value,
                    taskId: "",
                  }))
                }
                className="font-dosis"
                disabled={!!form.taskId}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="font-dosis text-sm font-medium">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                  className="font-dosis pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-dosis text-sm font-medium">End Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                  className="font-dosis pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-dosis text-sm font-medium">
              Description (Optional)
            </label>
            <Textarea
              placeholder="Add notes about this time entry..."
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="font-dosis resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onClose(false)}
              className="font-dosis flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="font-dosis flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? "Adding..." : "Add Entry"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTimeEntryModal;
