"use client";

import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { FC } from "react";

interface EmptyTimeEntriesProps {
  onAddEntry: () => void;
}

const EmptyTimeEntries: FC<EmptyTimeEntriesProps> = ({ onAddEntry }) => {
  return (
    <div className="text-center py-20">
      <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
      <h3 className="font-dosis text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        No entries yet
      </h3>
      <p className="font-dosis text-gray-600 dark:text-gray-400 mb-6">
        Start tracking your time for this day
      </p>
      <Button
        onClick={onAddEntry}
        className="font-dosis bg-orange-500 hover:bg-orange-600"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add First Entry
      </Button>
    </div>
  );
};

export default EmptyTimeEntries;
