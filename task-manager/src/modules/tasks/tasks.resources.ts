import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { TaskService } from './task.service.js';

/**
 * TaskResources — MCP resources that expose read-only data endpoints.
 *
 * Resources are like GET endpoints: the AI reads them to understand
 * the current state of the system without performing any action.
 */
export class TaskResources {
  constructor(private readonly taskService: TaskService) {}

  // ──────────────────────────────────────────────
  // ALL TASKS LIST
  // ──────────────────────────────────────────────
  @Resource({
    uri: 'tasks://all',
    name: 'All Tasks',
    description: 'Returns the full list of tasks sorted by priority',
    mimeType: 'application/json',
  })
  async getAllTasks(_uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Resource read: tasks://all');
    const tasks = this.taskService.getAllTasks();
    return {
      contents: [
        {
          uri: 'tasks://all',
          mimeType: 'application/json',
          text: JSON.stringify({ total: tasks.length, tasks }, null, 2),
        },
      ],
    };
  }

  // ──────────────────────────────────────────────
  // TASK STATISTICS
  // ──────────────────────────────────────────────
  @Resource({
    uri: 'tasks://stats',
    name: 'Task Statistics',
    description:
      'Aggregated stats: total count, breakdown by status and priority, overdue count',
    mimeType: 'application/json',
  })
  async getStats(_uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Resource read: tasks://stats');
    const stats = this.taskService.getStats();
    return {
      contents: [
        {
          uri: 'tasks://stats',
          mimeType: 'application/json',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }
}
