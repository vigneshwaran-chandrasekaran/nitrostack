import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { PostsModule } from './modules/posts/posts.module.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'jsonplaceholder',
    version: '1.0.0',
  },
})
@Module({
  name: 'AppModule',
  imports: [
    ConfigModule.forRoot(),
    PostsModule,
  ],
})
export class AppModule {}
