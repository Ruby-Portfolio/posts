import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { AddPostDto } from './post.request.dto';
import * as bcrypt from 'bcrypt';
import { InsertResult } from 'typeorm';

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
}
