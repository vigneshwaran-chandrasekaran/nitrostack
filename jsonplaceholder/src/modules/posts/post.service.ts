import { Injectable } from '@nitrostack/core';
import type { Post, Comment } from './post.model.js';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

@Injectable()
export class PostService {
  /**
   * GET /posts
   * Returns all posts.
   */
  async getAllPosts(): Promise<Post[]> {
    const res = await fetch(`${BASE_URL}/posts`);
    if (!res.ok) throw new Error(`Failed to fetch posts: ${res.statusText}`);
    return res.json() as Promise<Post[]>;
  }

  /**
   * GET /posts/:id
   * Returns a single post by ID.
   */
  async getPost(id: number): Promise<Post> {
    const res = await fetch(`${BASE_URL}/posts/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch post ${id}: ${res.statusText}`);
    return res.json() as Promise<Post>;
  }

  /**
   * GET /posts/:id/comments
   * Returns all comments for a given post ID.
   */
  async getPostComments(postId: number): Promise<Comment[]> {
    const res = await fetch(`${BASE_URL}/posts/${postId}/comments`);
    if (!res.ok) throw new Error(`Failed to fetch comments for post ${postId}: ${res.statusText}`);
    return res.json() as Promise<Comment[]>;
  }
}
