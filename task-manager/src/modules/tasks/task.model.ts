// Task priority levels
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// Task lifecycle status
export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'cancelled';

// Core Task entity
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;          // ISO 8601 date string e.g. "2026-05-10"
  tags: string[];
  createdAt: string;         // ISO 8601 datetime
  updatedAt: string;         // ISO 8601 datetime
}

// Payload for creating a task
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

// Payload for updating a task
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  tags?: string[];
}

// Statistics snapshot
export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
}
