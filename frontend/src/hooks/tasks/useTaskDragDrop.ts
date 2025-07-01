"use client";

import { useWorkspaceStore } from "@/store";
import { useCallback } from "react";
import { DropResult } from "react-beautiful-dnd";

export const useTaskDragDrop = () => {
  const { moveTask } = useWorkspaceStore();

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;

      // If dropped outside a valid drop zone
      if (!destination) {
        return;
      }

      // If dropped in the same position
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      try {
        // Move task between columns or reorder within same column
        await moveTask(draggableId, destination.droppableId);
      } catch (error) {
        console.error("Failed to move task:", error);
        // Optionally show error toast/notification
      }
    },
    [moveTask]
  );

  return {
    onDragEnd,
  };
};
