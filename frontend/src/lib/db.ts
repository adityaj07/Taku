import Dexie, { Table } from "dexie";

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  column: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  timeSpent: number; // in minutes
  isActive: boolean;
  startTime?: string;
}

export interface TimeEntry {
  id: string;
  workspaceId: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  description?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerName: string;
  role: "Student" | "Developer" | "Designer" | "Other";
  createdAt: string;
  columns: string[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  weeklyGoals: number;
  theme: "system" | "light" | "dark";
  settings: {
    heatmap: boolean;
    mascot: boolean;
    autoBackup: boolean;
    compactMode: boolean;
  };
}

export class TakuDatabase extends Dexie {
  workspaces!: Table<Workspace>;
  tasks!: Table<Task>;
  timeEntries!: Table<TimeEntry>;

  constructor() {
    super("TakuDatabase");
    this.version(1).stores({
      workspaces: "id, name, ownerName, role, createdAt",
      tasks: "id, workspaceId, title, column, priority, dueDate, createdAt",
      timeEntries: "id, workspaceId, taskId, startTime, endTime, createdAt",
    });
  }
}

export const db = new TakuDatabase();
