"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Save, X } from "lucide-react";
import { FC } from "react";

interface EditingTimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface TimeEntryEditFormProps {
  editingEntry: EditingTimeEntry;
  onSave: () => void;
  onCancel: () => void;
  onChange: (updates: Partial<EditingTimeEntry>) => void;
}

const TimeEntryEditForm: FC<TimeEntryEditFormProps> = ({
  editingEntry,
  onSave,
  onCancel,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
          Edit Time Entry
        </h4>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={onSave}
            className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
          >
            <Save className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-dosis text-sm font-medium mb-1 block">
            Start Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="time"
              value={editingEntry.startTime}
              onChange={(e) => onChange({ startTime: e.target.value })}
              className="font-dosis pl-10"
            />
          </div>
        </div>
        <div>
          <label className="font-dosis text-sm font-medium mb-1 block">
            End Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="time"
              value={editingEntry.endTime}
              onChange={(e) => onChange({ endTime: e.target.value })}
              className="font-dosis pl-10"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="font-dosis text-sm font-medium mb-1 block">
          Description
        </label>
        <Textarea
          value={editingEntry.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="font-dosis resize-none"
          rows={2}
        />
      </div>
    </div>
  );
};

export default TimeEntryEditForm;
