import { Test, TestingModule } from '@nestjs/testing';
import { PostRepository } from '../../../domain/post/post.repository';
import { PostService } from '../../../domain/post/post.service';
import { AddPostDto } from '../../../domain/post/post.request.dto';
import { InsertResult } from 'typeorm';

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

      jest
        .spyOn(postRepository, 'insert')
        .mockResolvedValue(Promise.resolve(new InsertResult()));

      expect(await postService.addPost(addPost)).toEqual(new InsertResult());
    });
  });
});
