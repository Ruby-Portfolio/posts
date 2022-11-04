import { Test, TestingModule } from '@nestjs/testing';
import { PostRepository } from '../../../domain/post/post.repository';
import { PostService } from '../../../domain/post/post.service';
import {
  AddPostDto,
  UpdatePostDto,
} from '../../../domain/post/post.request.dto';
import { InsertResult, UpdateResult } from 'typeorm';
import {
  PasswordMismatchException,
  PostNotFoundException,
} from '../../../domain/post/post.exception';
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

  describe('게시글 수정', () => {
    describe('게시글 수정 실패', () => {
      test('수정할 게시글이 존재하지 않을 경우 PostNotFoundException 예외 처리', async () => {
        const post: Post = {
          id: 10,
          title: '테스트',
          password: 'asd13ad',
          content: 'asdasd',
          author: '루비',
        } as Post;

        jest
          .spyOn(postRepository, 'findOneBy')
          .mockResolvedValue(Promise.resolve(null));

        return expect(postService.updatePost(10, post)).rejects.toThrowError(
          new PostNotFoundException(),
        );
      });

      test('비밀번호가 일치하지 않을 경우 PasswordMismatchException 예외 처리', async () => {
        const post = new Post();

        const updatePost: UpdatePostDto = {
          title: '테스트',
          password: 'asdasd1123',
          content: 'asdasd',
          author: '루비',
        } as Post;

        jest
          .spyOn(postRepository, 'findOneBy')
          .mockResolvedValue(Promise.resolve(post));
        jest
          .spyOn(post, 'equalsPassword')
          .mockResolvedValue(Promise.resolve(false));

        return expect(
          postService.updatePost(10, updatePost),
        ).rejects.toThrowError(new PasswordMismatchException());
      });
    });

    test('게시글 수정 성공', async () => {
      const post = new Post();

      const updatePost: UpdatePostDto = {
        title: '테스트',
        password: 'asdasd1123',
        content: 'asdasd',
        author: '루비',
      } as Post;

      jest
        .spyOn(postRepository, 'findOneBy')
        .mockResolvedValue(Promise.resolve(post));
      jest
        .spyOn(post, 'equalsPassword')
        .mockResolvedValue(Promise.resolve(true));
      jest
        .spyOn(postRepository, 'update')
        .mockResolvedValue(new UpdateResult());

      return expect(postService.updatePost(10, updatePost)).resolves.toEqual(
        new UpdateResult(),
      );
    });
  });
});
