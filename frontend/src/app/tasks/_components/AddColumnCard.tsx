import { Plus } from "lucide-react";

interface AddColumnCardProps {
  onAddColumn: () => void;
}

export const AddColumnCard = ({ onAddColumn }: AddColumnCardProps) => {
  return (
    <div
      onClick={onAddColumn}
      className="flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center min-h-[400px] hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 cursor-pointer transition-all duration-200 group"
    >
      <div className="text-center w-full">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-100 dark:group-hover:bg-orange-950/30 transition-colors duration-200 mx-auto">
          <Plus className="w-8 h-8 text-gray-500 group-hover:text-orange-600 transition-colors duration-200" />
        </div>
        <h3 className="font-dosis text-lg font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 transition-colors duration-200 mb-2">
          Add Column
        </h3>
        <p className="font-dosis text-sm text-gray-500 dark:text-gray-400">
          Create a new column to organize your tasks
        </p>
      </div>
    </div>
  );
};
