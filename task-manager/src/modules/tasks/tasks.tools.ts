import { ToolDecorator as Tool, z, ExecutionContext } from '@nitrostack/core';
import { TaskService } from './task.service.js';

/**
 * TaskTools — MCP tools that an AI model can invoke.
 *
 * Tools registered here are automatically discovered by NitroStack when the
 * class is listed in the module's `providers` array.
 */
export class TaskTools {
  constructor(private readonly taskService: TaskService) {}

  // ──────────────────────────────────────────────
  // CREATE TASK
  // ──────────────────────────────────────────────
  @Tool({
    name: 'create_task',
    description: 'Create a new task in the task manager',
    inputSchema: z.object({
      title: z.string().min(1).describe('Short, descriptive task title'),
      description: z
        .string()
        .optional()
        .describe('Detailed description of what needs to be done'),
      priority: z
        .enum(['low', 'medium', 'high', 'critical'])
        .default('medium')
        .describe('Task priority level'),
      dueDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .describe('Due date in YYYY-MM-DD format, e.g. "2026-05-15"'),
      tags: z
        .array(z.string())
        .default([])
        .describe('Optional list of tags, e.g. ["backend", "urgent"]'),
    }),
    examples: {
      request: {
        title: 'Deploy to production',
        description: 'Run final smoke tests and deploy v2.0',
        priority: 'high',
        dueDate: '2026-05-10',
        tags: ['deployment', 'release'],
      },
      response: {
        id: '5',
        title: 'Deploy to production',
        status: 'pending',
        priority: 'high',
      },
    },
  })
  async createTask(
    input: {
      title: string;
      description?: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      dueDate?: string;
      tags: string[];
    },
    ctx: ExecutionContext,
  ) {
    ctx.logger.info('Creating task', { title: input.title });
    const task = this.taskService.createTask(input);
    return {
      success: true,
      message: `Task "${task.title}" created with ID ${task.id}`,
      task,
    };
  }

  // ──────────────────────────────────────────────
  // LIST TASKS
  // ──────────────────────────────────────────────
  @Tool({
    name: 'list_tasks',
    description: 'List all tasks, optionally filtered by status or priority',
    inputSchema: z.object({
      status: z
        .enum(['pending', 'in-progress', 'done', 'cancelled'])
        .optional()
        .describe('Filter tasks by status'),
      priority: z
        .enum(['low', 'medium', 'high', 'critical'])
        .optional()
        .describe('Filter tasks by priority'),
    }),
    examples: {
      request: { status: 'pending', priority: 'high' },
      response: { total: 2, tasks: [] },
    },
  })
  async listTasks(
    input: {
      status?: 'pending' | 'in-progress' | 'done' | 'cancelled';
      priority?: 'low' | 'medium' | 'high' | 'critical';
    },
    ctx: ExecutionContext,
  ) {
    ctx.logger.info('Listing tasks', input);
    const tasks = this.taskService.getAllTasks(input);
    return {
      total: tasks.length,
      filters: input,
      tasks,
    };
  }

  // ──────────────────────────────────────────────
  // GET SINGLE TASK
  // ──────────────────────────────────────────────
  @Tool({
    name: 'get_task',
    description: 'Get full details of a task by its ID',
    inputSchema: z.object({
      id: z.string().describe('The task ID returned when the task was created'),
    }),
    examples: {
      request: { id: '1' },
      response: { id: '1', title: 'Fix bug', status: 'in-progress' },
    },
  })
  async getTask(input: { id: string }, ctx: ExecutionContext) {
    ctx.logger.info('Fetching task', { id: input.id });
    const task = this.taskService.getTask(input.id);
    if (!task) {
      return { success: false, message: `Task with ID "${input.id}" not found` };
    }
    return { success: true, task };
  }

  // ──────────────────────────────────────────────
  // UPDATE TASK
  // ──────────────────────────────────────────────
  @Tool({
    name: 'update_task',
    description:
      'Update an existing task — change its title, description, status, priority, due date, or tags',
    inputSchema: z.object({
      id: z.string().describe('ID of the task to update'),
      title: z.string().min(1).optional().describe('New title'),
      description: z.string().optional().describe('New description'),
      status: z
        .enum(['pending', 'in-progress', 'done', 'cancelled'])
        .optional()
        .describe('New status'),
      priority: z
        .enum(['low', 'medium', 'high', 'critical'])
        .optional()
        .describe('New priority'),
      dueDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .describe('New due date in YYYY-MM-DD format'),
      tags: z.array(z.string()).optional().describe('Replace tags list'),
    }),
    examples: {
      request: { id: '1', status: 'done' },
      response: { success: true, task: { id: '1', status: 'done' } },
    },
  })
  async updateTask(
    input: {
      id: string;
      title?: string;
      description?: string;
      status?: 'pending' | 'in-progress' | 'done' | 'cancelled';
      priority?: 'low' | 'medium' | 'high' | 'critical';
      dueDate?: string;
      tags?: string[];
    },
    ctx: ExecutionContext,
  ) {
    const { id, ...updates } = input;
    ctx.logger.info('Updating task', { id, updates });
    const task = this.taskService.updateTask(id, updates);
    if (!task) {
      return { success: false, message: `Task with ID "${id}" not found` };
    }
    return {
      success: true,
      message: `Task "${task.title}" updated successfully`,
      task,
    };
  }

  // ──────────────────────────────────────────────
  // DELETE TASK
  // ──────────────────────────────────────────────
  @Tool({
    name: 'delete_task',
    description: 'Permanently delete a task by its ID',
    inputSchema: z.object({
      id: z.string().describe('ID of the task to delete'),
    }),
    examples: {
      request: { id: '3' },
      response: { success: true, message: 'Task "Old task" deleted' },
    },
  })
  async deleteTask(input: { id: string }, ctx: ExecutionContext) {
    ctx.logger.info('Deleting task', { id: input.id });
    const task = this.taskService.getTask(input.id);
    if (!task) {
      return { success: false, message: `Task with ID "${input.id}" not found` };
    }
    this.taskService.deleteTask(input.id);
    return {
      success: true,
      message: `Task "${task.title}" (ID: ${input.id}) has been deleted`,
    };
  }
}
