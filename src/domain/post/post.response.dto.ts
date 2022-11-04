import { Post } from './post.entity';

export class PostsResponse {
  constructor(posts: Post[]) {
    this.contents = posts?.map((post) => {
      return { ...post, ...post.dateColumns };
    });
    if (posts.length > 0) {
      this.beforeLastId = posts[posts.length - 1].id;
    }
  }

  beforeLastId: number;
  contents: {
    id: number;
    author: string;
    title: string;
    createAt: Date;
  }[];
}

export class PostResponse {
  constructor(post: Post) {
    this.content = { ...post, ...post.dateColumns };
  }

  content: {
    id: number;
    author: string;
    title: string;
    content: string;
    createAt: Date;
  };
}
