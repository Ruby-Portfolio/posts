import { Test, TestingModule } from '@nestjs/testing';
import { PostRepository } from '../../../domain/post/post.repository';
import { PostService } from '../../../domain/post/post.service';
import { AddPostDto } from '../../../domain/post/post.request.dto';
import { InsertResult } from 'typeorm';
import { PostNotFoundException } from '../../../domain/post/post.exception';
import { Post } from '../../../domain/post/post.entity';

describe('PostService', () => {
  let postRepository: PostRepository;
  let postService: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService, PostRepository],
    }).compile();

    postRepository = module.get<PostRepository>(PostRepository);
    postService = module.get<PostService>(PostService);
  });

  describe('게시글 등록', () => {
    test('게시글 등록 성공', async () => {
      const addPost: AddPostDto = {
        author: '루비',
        password: '1234qwer',
        title: '게시글 등록 테스트',
        content: '게시글 등록 테스트 본문',
      };
      const insertResult = new InsertResult();
      jest
        .spyOn(postRepository, 'insert')
        .mockResolvedValue(Promise.resolve(insertResult));

      return expect(postService.addPost(addPost)).resolves.toEqual(
        insertResult,
      );
    });
  });

  describe('게시글 상세 조회', () => {
    test('게시글 상세 조회 결과가 없을 경우 PostNotFoundException 예외 처리', async () => {
      jest
        .spyOn(postRepository, 'findOneBy')
        .mockResolvedValue(Promise.resolve(null));

      return expect(postService.getPost(10)).rejects.toThrowError(
        new PostNotFoundException(),
      );
    });

    test('게시글 상세 조회 성공', async () => {
      const post: Post = {
        id: 1,
        title: '테스트',
        password: 'asd13ad',
        content: 'asdasd',
        author: '루비',
      } as Post;

      jest
        .spyOn(postRepository, 'findOneBy')
        .mockResolvedValue(Promise.resolve(post));

      return expect(postService.getPost(10)).resolves.toEqual(post);
    });
  });
});
