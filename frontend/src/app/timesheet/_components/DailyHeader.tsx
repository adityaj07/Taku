"use client";

import { format } from "date-fns";
import { Timer } from "lucide-react";
import { FC } from "react";

interface DailyHeaderProps {
  selectedDate: Date;
  entryCount: number;
}

const DailyHeader: FC<DailyHeaderProps> = ({ selectedDate, entryCount }) => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h2 className="font-dosis text-xl font-semibold text-gray-900 dark:text-gray-100">
          {format(selectedDate, "EEEE, MMMM dd")}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Timer className="w-4 h-4" />
          <span className="font-dosis">
            {entryCount} {entryCount === 1 ? "entry" : "entries"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyHeader;
