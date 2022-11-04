import { Post } from './post.entity';

export class PostsResponse {
  constructor(posts: Post[]) {
    this.contents = posts?.map((post) => {
      return { ...post, ...post.dateColumns };
    });
  }

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
