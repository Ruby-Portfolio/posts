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

  /**
   * 게시글 등록
   * @param author 게시글 작성자
   * @param password 게시글 비밀번호
   * @param title 게시글 제목
   * @param content 게시글 내용
   */
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

  /**
   * 게시글 조회
   * @param getPosts 게시글 검색 조건
   */
  async getPosts(getPosts: GetPostsDto): Promise<Post[]> {
    return this.postRepository.getPosts(getPosts);
  }

  /**
   * 게시글 상세 조회
   * @param id 상세 조회할 게시글 Id
   */
  async getPost(id: number): Promise<Post> {
    const post = await this.postRepository.findOneBy({ id });

    if (!post) {
      throw new PostNotFoundException();
    }

    return post;
  }

  /**
   * 게시글 수정
   * @param id 수정할 게시글 Id
   * @param author 게시글 작성자
   * @param password 게시글 비밀번호
   * @param title 게시글 제목
   * @param content 게시글 내용
   */
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

  /**
   * 게시글 삭제
   * @param id 삭제할 게시글 Id
   * @param password 게시글 비밀번호
   */
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
