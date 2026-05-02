import { Module } from '@nitrostack/core';
import { PostService } from './post.service.js';
import { PostsTools } from './posts.tools.js';
import { PostsResources } from './posts.resources.js';

@Module({
  name: 'PostsModule',
  controllers: [PostsTools, PostsResources],
  providers: [PostService],
})
export class PostsModule {}
