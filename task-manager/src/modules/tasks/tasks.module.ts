import { Module } from '@nitrostack/core';
import { TaskService } from './task.service.js';
import { TaskTools } from './tasks.tools.js';
import { TaskResources } from './tasks.resources.js';
import { TaskPrompts } from './tasks.prompts.js';

/**
 * TasksModule — bundles the service, tools, resources, and prompts.
 *
 * - controllers: classes decorated with @Tool / @Resource / @Prompt
 * - providers:   injectable services resolved via DI
 */
@Module({
  name: 'TasksModule',
  controllers: [TaskTools, TaskResources, TaskPrompts],
  providers: [TaskService],
})
export class TasksModule {}
