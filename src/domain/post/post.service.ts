import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import {
  AddPostDto,
  DeletePostDto,
  GetPostsDto,
  UpdatePostDto,
} from './post.request.dto';
import * as bcrypt from 'bcrypt';
import { InsertResult, UpdateResult } from 'typeorm';
import { Post } from './post.entity';
import {
  PasswordMismatchException,
  PostNotFoundException,
} from './post.exception';

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

  async getPosts(getPosts: GetPostsDto): Promise<Post[]> {
    return this.postRepository.getPosts(getPosts);
  }

  async getPost(id: number): Promise<Post> {
    const post = await this.postRepository.findOneBy({ id });

    if (!post) {
      throw new PostNotFoundException();
    }

    return post;
  }

  async updatePost(
    id: number,
    { author, password, title, content }: UpdatePostDto,
  ): Promise<UpdateResult> {
    const existsPost = await this.postRepository.findOneBy({ id });

    if (!existsPost) {
      throw new PostNotFoundException();
    }

    if (!(await existsPost.equalsPassword(password))) {
      throw new PasswordMismatchException();
    }

    return this.postRepository.update(id, {
      author,
      title,
      content,
    });
  }

  async deletePost(
    id: number,
    { password }: DeletePostDto,
  ): Promise<UpdateResult> {
    const existsPost = await this.postRepository.findOneBy({ id });

    if (!existsPost) {
      throw new PostNotFoundException();
    }

    if (!(await existsPost.equalsPassword(password))) {
      throw new PasswordMismatchException();
    }

    return this.postRepository.softDelete(id);
  }
}
