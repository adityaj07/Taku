import { Task } from "@/lib/db";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { AddColumnCard } from "./AddColumnCard";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  columns: string[];
  tasksByColumn: Record<string, Task[]>;
  activeTimers: Record<string, number>;
  onDragEnd: (result: DropResult) => void;
  onAddTask: (column: string) => void;
  onAddColumn: () => void;
  onDeleteColumn: (column: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onTimerToggle: (task: Task) => void;
}

export const KanbanBoard = ({
  columns,
  tasksByColumn,
  activeTimers,
  onDragEnd,
  onAddTask,
  onAddColumn,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onDuplicateTask,
  onTimerToggle,
}: KanbanBoardProps) => {
  return (
    <div className="h-full p-6 overflow-hidden flex flex-col">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-6 h-full min-w-max pb-4">
            {/* Render Columns */}
            {columns.map((column) => {
              const tasks = tasksByColumn[column] || [];
              return (
                <KanbanColumn
                  key={column}
                  column={column}
                  tasks={tasks}
                  activeTimers={activeTimers}
                  onAddTask={onAddTask}
                  onDeleteColumn={onDeleteColumn}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  onCompleteTask={onCompleteTask}
                  onDuplicateTask={onDuplicateTask}
                  onTimerToggle={onTimerToggle}
                />
              );
            })}

            {/* Add Column Card */}
            <AddColumnCard onAddColumn={onAddColumn} />
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};
