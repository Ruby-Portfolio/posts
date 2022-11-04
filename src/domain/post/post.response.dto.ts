import { Post } from './post.entity';

export class PostsResponse {
  constructor(posts: Post[]) {
    this.contents = posts?.map((post) => {
      const { id, author, title, content } = post;
      return { id, author, title, content };
    });
  }

  contents: { id: number; author: string; title: string; content: string }[];
}
