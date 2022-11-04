import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { AddPostDto, GetPostsDto } from './post.request.dto';
import * as bcrypt from 'bcrypt';
import { InsertResult } from 'typeorm';
import { Post } from './post.entity';
import { PostNotFoundException } from './post.exception';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async addPost({
    author,
    password,
    title,
    content,
  }: AddPostDto): Promise<InsertResult> {
    const hashedPassword = await bcrypt.hash(password, 12);

    return this.postRepository.insert({
      author,
      password: hashedPassword,
      title,
      content,
    });
  }

  async getPosts(getPostsDto: GetPostsDto): Promise<Post[]> {
    return this.postRepository.getPosts(getPostsDto);
  }

  async getPost(id: number): Promise<Post> {
    const post = await this.postRepository.findOneBy({ id });

    if (!post) {
      throw new PostNotFoundException();
    }

    return post;
  }
}
