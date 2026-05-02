import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';
import { TaskService } from './task.service.js';

/**
 * TaskPrompts — MCP prompt templates.
 *
 * Prompts are reusable conversation starters that guide the AI on how to
 * approach a domain. They return structured message arrays consumed by LLMs.
 */
export class TaskPrompts {
  constructor(private readonly taskService: TaskService) {}

  // ──────────────────────────────────────────────
  // HELP PROMPT
  // ──────────────────────────────────────────────
  @Prompt({
    name: 'task_manager_help',
    description: 'Get instructions on how to use the Task Manager MCP server',
    arguments: [],
  })
  async getHelp(_args: Record<string, string>, ctx: ExecutionContext) {
    ctx.logger.info('Prompt used: task_manager_help');
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'How do I use the task manager?',
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `
# Task Manager — How to Use

The Task Manager MCP server exposes the following capabilities:

## 🔧 Tools (Actions)
| Tool | What it does |
|------|-------------|
| \`create_task\` | Create a new task with title, description, priority, due date, tags |
| \`list_tasks\` | List tasks, optionally filtered by status or priority |
| \`get_task\` | Get full details of a task by ID |
| \`update_task\` | Change a task's title, status, priority, due date, or tags |
| \`delete_task\` | Permanently remove a task |

## 📦 Resources (Read-only data)
| URI | What it provides |
|-----|-----------------|
| \`tasks://all\` | Complete list of all tasks sorted by priority |
| \`tasks://stats\` | Aggregated stats (totals by status, priority, overdue count) |

## 📝 Prompts (Templates)
| Name | Purpose |
|------|---------|
| \`task_manager_help\` | This help message |
| \`daily_standup\` | Generate a daily standup report based on current tasks |

## 📌 Priority Levels
\`low\` → \`medium\` → \`high\` → \`critical\`

## 🔄 Status Flow
\`pending\` → \`in-progress\` → \`done\` (or \`cancelled\`)

## Examples
- "Create a high-priority task to fix the login bug, due 2026-05-10"
- "Show me all pending tasks"
- "Mark task 3 as done"
- "What tasks are overdue?"
            `.trim(),
          },
        },
      ],
    };
  }

  // ──────────────────────────────────────────────
  // DAILY STANDUP PROMPT
  // ──────────────────────────────────────────────
  @Prompt({
    name: 'daily_standup',
    description:
      'Generate a daily standup report summarising what was done, what is in progress, and blockers',
    arguments: [
      {
        name: 'team_name',
        description: 'Name of the team or person for the standup',
        required: false,
      },
    ],
  })
  async dailyStandup(
    args: { team_name?: string },
    ctx: ExecutionContext,
  ) {
    ctx.logger.info('Prompt used: daily_standup', args);
    const stats = this.taskService.getStats();
    const inProgress = this.taskService.getAllTasks({ status: 'in-progress' });
    const done = this.taskService.getAllTasks({ status: 'done' });
    const pending = this.taskService.getAllTasks({ status: 'pending' });

    const teamLine = args.team_name ? `**Team:** ${args.team_name}` : '';
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formatTaskList = (
      tasks: ReturnType<TaskService['getAllTasks']>,
    ) =>
      tasks.length === 0
        ? '  — None'
        : tasks
            .map(
              (t) =>
                `  • [${t.priority.toUpperCase()}] ${t.title}${t.dueDate ? ` (due ${t.dueDate})` : ''}`,
            )
            .join('\n');

    const standupText = `
# Daily Standup — ${today}
${teamLine}

## ✅ Completed
${formatTaskList(done)}

## 🔄 In Progress
${formatTaskList(inProgress)}

## 📋 Upcoming (Pending)
${formatTaskList(pending.slice(0, 5))}

## 📊 Summary
- Total tasks: ${stats.total}
- In progress: ${stats.byStatus['in-progress']}
- Done: ${stats.byStatus['done']}
- Overdue: ${stats.overdue} ${stats.overdue > 0 ? '⚠️' : '✓'}
    `.trim();

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Generate a daily standup report${args.team_name ? ` for ${args.team_name}` : ''}`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: standupText,
          },
        },
      ],
    };
  }
}
