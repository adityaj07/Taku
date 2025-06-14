"use client";

import { useCallback } from "react";
import { DropResult } from "react-beautiful-dnd";
import { useWorkspaceStore } from "@/store";

export const useTaskDragDrop = () => {
  const { moveTask } = useWorkspaceStore();

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;

      // No destination - dropped outside
      if (!destination) return;

      // Dropped in the same position
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      try {
        await moveTask(draggableId, destination.droppableId);
      } catch (error) {
        console.error("Failed to move task:", error);
        // Could add toast notification here
      }
    },
    [moveTask]
  );

  return {
    onDragEnd,
  };
};
