import { TaskCard } from "@/components/TaskCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/lib/db";
import { cn } from "@/lib/utils";
import { MoreVertical, Plus, Trash2 } from "lucide-react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import EmptyColumnState from "./emptyStates/EmptyColumnState";

interface KanbanColumnProps {
  column: string;
  tasks: Task[];
  activeTimers: Record<string, number>;
  onAddTask: (column: string) => void;
  onDeleteColumn: (column: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onTimerToggle: (task: Task) => void;
  isDeletable?: boolean;
}

export const KanbanColumn = ({
  column,
  tasks,
  activeTimers,
  onAddTask,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onDuplicateTask,
  onTimerToggle,
  isDeletable = true,
}: KanbanColumnProps) => {
  const isSystemColumn =
    column === "Todo" || column === "In Progress" || column === "Done";

  return (
    <div className="flex-shrink-0 w-80 flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2">
          <h3 className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
            {column}
          </h3>
          <span className="text-sm text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Add Task Button */}
          <button
            onClick={() => onAddTask(column)}
            className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-md transition-colors"
            title={`Add task to ${column}`}
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Column Options (only for non-system columns) */}
          {!isSystemColumn && isDeletable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDeleteColumn(column)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Droppable Column */}
      <div className="flex-1 min-h-0 mt-2">
        <Droppable droppableId={column}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "h-full p-3 rounded-xl border-2 border-dashed transition-all duration-200 overflow-y-auto",
                snapshot.isDraggingOver
                  ? "border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-950/20 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/30 dark:bg-gray-800/30"
              )}
            >
              {tasks.length === 0 ? (
                <EmptyColumnState
                  column={column}
                  isDraggingOver={snapshot.isDraggingOver}
                  onAddTask={() => onAddTask(column)}
                />
              ) : (
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <TaskCard
                          ref={provided.innerRef}
                          task={task}
                          activeTimer={activeTimers[task.id]}
                          variant="kanban"
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          onComplete={onCompleteTask}
                          onDuplicate={onDuplicateTask}
                          onTimerToggle={onTimerToggle}
                          isDragging={snapshot.isDragging}
                          dragHandleProps={provided.dragHandleProps}
                          style={{
                            userSelect: "none",
                            ...provided.draggableProps.style,
                          }}
                          {...provided.draggableProps}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};
