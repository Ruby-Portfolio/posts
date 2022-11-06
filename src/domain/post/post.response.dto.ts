import { Post } from './post.entity';

export class PostsResponse {
  constructor(posts: Post[]) {
    this.posts = posts?.map((post) => {
      return { ...post, ...post.dateColumns };
    });
    if (posts.length > 0) {
      this.beforeLastId = posts[posts.length - 1].id;
    }
  }

  beforeLastId: number;
  posts: {
    id: number;
    author: string;
    title: string;
    createAt: Date;
  }[];
}

export class PostResponse {
  constructor(post: Post) {
    this.post = { ...post, ...post.dateColumns };
  }

  post: {
    id: number;
    author: string;
    title: string;
    content: string;
    createAt: Date;
  };
}
