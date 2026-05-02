import { Injectable } from '@nitrostack/core';
import type {
  Task,
  TaskStats,
  TaskStatus,
  TaskPriority,
  CreateTaskInput,
  UpdateTaskInput,
} from './task.model.js';

/**
 * TaskService — in-memory store for tasks.
 * In a real application, swap this out for a database (Postgres, SQLite, etc.)
 */
@Injectable()
export class TaskService {
  // In-memory store: task id → Task
  private readonly tasks = new Map<string, Task>();
  private idCounter = 1;

  constructor() {
    // Seed demo data so the server has tasks to explore immediately
    this.seedDemoTasks();
  }

  // ──────────────────────────────────────────────
  // CRUD helpers
  // ──────────────────────────────────────────────

  createTask(input: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: String(this.idCounter++),
      title: input.title,
      description: input.description ?? '',
      priority: input.priority ?? 'medium',
      status: 'pending',
      dueDate: input.dueDate,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  getAllTasks(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
  }): Task[] {
    let list = Array.from(this.tasks.values());
    if (filters?.status) {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters?.priority) {
      list = list.filter((t) => t.priority === filters.priority);
    }
    // Sort: critical first, then by createdAt desc
    const priorityOrder: Record<TaskPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return list.sort(
      (a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  updateTask(id: string, input: UpdateTaskInput): Task | null {
    const task = this.tasks.get(id);
    if (!task) return null;
    const updated: Task = {
      ...task,
      ...Object.fromEntries(
        Object.entries(input).filter(([, v]) => v !== undefined),
      ),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  getStats(): TaskStats {
    const list = Array.from(this.tasks.values());
    const today = new Date();

    const byStatus: Record<TaskStatus, number> = {
      pending: 0,
      'in-progress': 0,
      done: 0,
      cancelled: 0,
    };
    const byPriority: Record<TaskPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    let overdue = 0;

    for (const t of list) {
      byStatus[t.status]++;
      byPriority[t.priority]++;
      if (
        t.dueDate &&
        t.status !== 'done' &&
        t.status !== 'cancelled' &&
        new Date(t.dueDate) < today
      ) {
        overdue++;
      }
    }

    return { total: list.length, byStatus, byPriority, overdue };
  }

  // Seed some demo tasks so the server has data right away
  seedDemoTasks(): void {
    if (this.tasks.size > 0) return;
    const demos: CreateTaskInput[] = [
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment.',
        priority: 'high',
        dueDate: '2026-05-15',
        tags: ['devops', 'automation'],
      },
      {
        title: 'Write unit tests for auth module',
        description: 'Achieve at least 80% coverage on the authentication service.',
        priority: 'medium',
        dueDate: '2026-05-20',
        tags: ['testing', 'auth'],
      },
      {
        title: 'Update README with API examples',
        description: 'Add code snippets for all public endpoints.',
        priority: 'low',
        tags: ['docs'],
      },
      {
        title: 'Fix critical production bug #42',
        description: 'Users are unable to reset passwords — hotfix required.',
        priority: 'critical',
        dueDate: '2026-05-03',
        tags: ['bug', 'production'],
      },
    ];
    for (const d of demos) this.createTask(d);
  }
}
