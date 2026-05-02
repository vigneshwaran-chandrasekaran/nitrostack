import { ToolDecorator as Tool, z, ExecutionContext } from '@nitrostack/core';
import { PostService } from './post.service.js';

export class PostsTools {
  constructor(private readonly postService: PostService) {}

  // ──────────────────────────────────────────────
  // GET ALL POSTS
  // ──────────────────────────────────────────────
  @Tool({
    name: 'get_all_posts',
    description: 'Fetch all posts from JSONPlaceholder API',
    inputSchema: z.object({}),
    examples: {
      request: {},
      response: [{ userId: 1, id: 1, title: 'sunt aut facere...', body: '...' }],
    },
  })
  async getAllPosts(_input: Record<string, never>, ctx: ExecutionContext) {
    ctx.logger.info('Fetching all posts');
    const posts = await this.postService.getAllPosts();
    return { total: posts.length, posts };
  }

  // ──────────────────────────────────────────────
  // GET POST BY ID
  // ──────────────────────────────────────────────
  @Tool({
    name: 'get_post',
    description: 'Fetch a single post by its ID from JSONPlaceholder API',
    inputSchema: z.object({
      id: z.number().int().min(1).max(100).describe('Post ID (1–100)'),
    }),
    examples: {
      request: { id: 1 },
      response: { userId: 1, id: 1, title: 'sunt aut facere...', body: '...' },
    },
  })
  async getPost(input: { id: number }, ctx: ExecutionContext) {
    ctx.logger.info('Fetching post', { id: input.id });
    const post = await this.postService.getPost(input.id);
    return { post };
  }

  // ──────────────────────────────────────────────
  // GET POST COMMENTS
  // ──────────────────────────────────────────────
  @Tool({
    name: 'get_post_comments',
    description: 'Fetch all comments for a specific post by its ID',
    inputSchema: z.object({
      postId: z.number().int().min(1).max(100).describe('Post ID whose comments to fetch'),
    }),
    examples: {
      request: { postId: 1 },
      response: [{ postId: 1, id: 1, name: 'John', email: 'john@example.com', body: '...' }],
    },
  })
  async getPostComments(input: { postId: number }, ctx: ExecutionContext) {
    ctx.logger.info('Fetching comments for post', { postId: input.postId });
    const comments = await this.postService.getPostComments(input.postId);
    return { postId: input.postId, total: comments.length, comments };
  }
}
