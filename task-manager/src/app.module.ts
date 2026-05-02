import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { TasksModule } from './modules/tasks/tasks.module.js';

/**
 * AppModule — root module of the Task Manager MCP server.
 *
 * @McpApp sets the server metadata exposed to MCP clients.
 * @Module declares which feature modules to load.
 */
@McpApp({
  module: AppModule,
  server: {
    name: 'task-manager',
    version: '1.0.0',
  },
})
@Module({
  name: 'AppModule',
  imports: [
    ConfigModule.forRoot(), // loads .env variables
    TasksModule,
  ],
})
export class AppModule {}
