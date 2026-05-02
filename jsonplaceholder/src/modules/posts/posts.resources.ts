import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { PostService } from './post.service.js';

export class PostsResources {
  constructor(private readonly postService: PostService) {}

  @Resource({
    uri: 'posts://all',
    name: 'All Posts',
    description: 'Returns the full list of posts from JSONPlaceholder',
    mimeType: 'application/json',
  })
  async getAllPosts(_uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Resource read: posts://all');
    const posts = await this.postService.getAllPosts();
    return {
      contents: [
        {
          uri: 'posts://all',
          mimeType: 'application/json',
          text: JSON.stringify({ total: posts.length, posts }, null, 2),
        },
      ],
    };
  }
}
