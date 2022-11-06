import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../../domain/post/post.entity';
import { PostRepository } from '../../../domain/post/post.repository';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { CustomTypeOrmModule } from '../../../module/typeOrm/customTypeOrm.module';
import { PostModule } from '../../../domain/post/post.module';
import { validationPipe } from '../../../common/pipe/validation.pipe';
import { PostErrorMessage } from '../../../domain/post/post.error.message';
import * as bcrypt from 'bcrypt';
import { CommonErrorMessage } from '../../../common/error/common.error.message';
import { containsCondition } from '../../../common/queryBrackets/queryBrackets';
import {
  PasswordMismatchException,
  PostNotFoundException,
} from '../../../domain/post/post.exception';
import { InvalidIdException } from '../../../common/error/common.exception';

describe('PostController', () => {
  let app: NestFastifyApplication;
  let postRepository: PostRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          entities: [Post],
          synchronize: true,
          logging: true,
        }),
        PostModule,
        CustomTypeOrmModule.forCustomRepository([PostRepository]),
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('/api');
    validationPipe(app);
    await app.init();

    postRepository = module.get<PostRepository>(PostRepository);
  });

  describe('/POST /api/posts', () => {
    describe('게시글 등록 실패', () => {
      test('작성자 명이 빈 문자열일 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '',
            password: '1234qwer',
            title: '게시글 등록 테스트',
            content: '게시글 등록 테스트 본문',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.AUTHOR_NOT_EMPTY,
        );
      });

      test('비밀번호가 6글자 미만일 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '루비',
            password: 'qwer1',
            title: '게시글 등록 테스트',
            content: '게시글 등록 테스트 본문',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(PostErrorMessage.PASSWORD);
      });

      test('비밀번호에 숫자가 포함되어 있지 않을 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '루비',
            password: 'qwerqwe',
            title: '게시글 등록 테스트',
            content: '게시글 등록 테스트 본문',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(PostErrorMessage.PASSWORD);
      });

      test('게시글 제목이 2글자 미만일 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '루비',
            password: 'qwerqwe12',
            title: '게',
            content: '게시글 등록 테스트 본문',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.TITLE_MIN_LENGTH,
        );
      });

      test('게시글 제목이 20글자 초과일 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '루비',
            password: 'qwerqwe12',
            title:
              '게시글 제목 게시글 제목 게시글 제목 게시글 제목 게시글 제목 ',
            content: '게시글 등록 테스트 본문',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.TITLE_MAX_LENGTH,
        );
      });

      test('게시글 본문이 2글자 미만일 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '루비',
            password: '1234qwer',
            title: '게시글 등록 테스트',
            content: '게',
          })
          .expect(400);
        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.CONTENT_MIN_LENGTH,
        );
      });

      test('게시글 본문이 200 글자 초과일 경우 400 응답', async () => {
        let content = '';
        for (let i = 0; i < 30; i++) {
          content += '게시글 등록 테스트 본문';
        }

        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '루비',
            password: 'qwerqwe12',
            title: '게시글 제목',
            content,
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.CONTENT_MAX_LENGTH,
        );
      });

      test('모든 필드 값이 빈 문자열일 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '',
            password: '',
            title: '',
            content: '',
          })
          .expect(400);

        await expect(res.body.message.length).toEqual(4);
        await expect(res.body.message).toContain(
          PostErrorMessage.AUTHOR_NOT_EMPTY,
        );
        await expect(res.body.message).toContain(PostErrorMessage.PASSWORD);
        await expect(res.body.message).toContain(
          PostErrorMessage.TITLE_MIN_LENGTH,
        );
        await expect(res.body.message).toContain(
          PostErrorMessage.CONTENT_MIN_LENGTH,
        );
      });
    });

    test('게시글 등록 성공', async () => {
      return request(app.getHttpServer())
        .post('/api/posts')
        .send({
          author: '루비',
          password: '1234qwer',
          title: '게시글 등록 테스트',
          content: '게시글 등록 테스트 본문',
        })
        .expect(201);
    });
  });

  describe('/GET /api/posts', () => {
    beforeAll(async () => {
      await postRepository.delete({});

      const posts = [];
      for (let i = 0; i < 34; i++) {
        const post = new Post();
        const password = '1234qwer';
        post.author = `작성자${i}`;
        post.password = await bcrypt.hash(password, 12);
        post.title = `게시글${i}`;
        post.content = `게시글 ${i}번쩨 본문입니다.`;
        posts.push(post);
      }
      await postRepository.save(posts);
    }, 25000);

    describe('게시글 상세 조회 실패', () => {
      test('이전 마지막 조회 게시글 id 값이 숫자가 아닌 경우 400 응답', async () => {
        const err = await request(app.getHttpServer())
          .get('/api/posts')
          .query({
            beforeLastId: '숫자아님',
          })
          .expect(400);

        return expect(err.body.message).toContain(
          CommonErrorMessage.ID_INVALID,
        );
      });
    });

    describe('게시글 상세 조회 성공', () => {
      test('이전 조회의 마지막 게시글 이후 목록 조회', async () => {
        const beforeLastPost = await postRepository
          .createQueryBuilder(Post.alias.entity)
          .where(containsCondition([Post.alias.title], '20'))
          .getOne();
        const beforeLastId = beforeLastPost.id;

        const res = await request(app.getHttpServer())
          .get('/api/posts')
          .query({ beforeLastId })
          .expect(200);

        await expect(
          res.body.posts.every((post) => post.id < beforeLastId),
        ).toBeTruthy();
        return expect(res.body.posts.length > 0).toBeTruthy();
      });

      test('검색어에 해당하는 게시글 목록 조회', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/posts')
          .query({ keyword: '게시글 2' })
          .expect(200);

        await expect(
          res.body.posts.every((post) => {
            return (
              post.title.indexOf('게시글') ||
              post.title.indexOf('2') ||
              post.content.indexOf('게시글') ||
              post.content.indexOf('2')
            );
          }),
        ).toBeTruthy();
        await expect(res.body.posts.length > 0).toBeTruthy();

        const minId = Math.min.apply(
          null,
          res.body.posts.map((post) => post.id),
        );

        await expect(res.body.beforeLastId).toEqual(minId);
      });

      test('이전 조회 목록의 마지막 게시글 이후의 목록 중에서 검색어에 해당하는 게시글 목록 조회', async () => {
        const beforeLastPost = await postRepository
          .createQueryBuilder(Post.alias.entity)
          .where(containsCondition([Post.alias.title], '게시글 20'))
          .getOne();
        const beforeLastId = beforeLastPost.id;

        const res = await request(app.getHttpServer())
          .get('/api/posts')
          .query({ beforeLastId, keyword: '게시글 2' })
          .expect(200);

        await expect(
          res.body.posts.every((post) => {
            return (
              post.id < beforeLastId &&
              (post.title.indexOf('게시글') ||
                post.title.indexOf('2') ||
                post.content.indexOf('게시글') ||
                post.content.indexOf('2'))
            );
          }),
        ).toBeTruthy();
        await expect(res.body.posts.length > 0).toBeTruthy();

        const minId = Math.min.apply(
          null,
          res.body.posts.map((post) => post.id),
        );

        await expect(res.body.beforeLastId).toEqual(minId);
      });

      test('검색조건 없이 게시글 목록 조회', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/posts')
          .expect(200);

        await expect(res.body.posts.length).toEqual(20);

        const minId = Math.min.apply(
          null,
          res.body.posts.map((post) => post.id),
        );

        await expect(res.body.beforeLastId).toEqual(minId);
      });
    });
  });

  describe('/GET /api/posts/:id', () => {
    let savedPost;

    beforeAll(async () => {
      await postRepository.delete({});

      const post = new Post();
      const password = '1234qwer';
      post.author = `작성자`;
      post.password = await bcrypt.hash(password, 12);
      post.title = `게시글`;
      post.content = `게시글 본문입니다.`;
      savedPost = await postRepository.save(post);
    });

    describe('게시글 상세 조회 실패', () => {
      test('존재하지 않는 게시글의 상세 조회시 404 응답', async () => {
        const id = savedPost.id + 999;
        const err = await request(app.getHttpServer())
          .get(`/api/posts/${id}`)
          .expect(404);

        return expect(err.body.message).toContain(
          new PostNotFoundException().message,
        );
      });

      test('잘못된 id 값으로 게시글 상세 조회시 400 응답', async () => {
        const err = await request(app.getHttpServer())
          .get(`/api/posts/asd`)
          .expect(400);

        return expect(err.body.message).toContain(
          new InvalidIdException().message,
        );
      });
    });

    test('게시글 상세 조회 성공', async () => {
      const id = savedPost.id;
      const res = await request(app.getHttpServer())
        .get(`/api/posts/${id}`)
        .expect(200);

      return expect(res.body.post.id).toEqual(id);
    });
  });

  describe('/PUT /api/posts/:id', () => {
    let savedPost;
    const password = '1234qwer';

    beforeAll(async () => {
      await postRepository.delete({});

      const post = new Post();
      post.author = `작성자`;
      post.password = await bcrypt.hash(password, 12);
      post.title = `게시글`;
      post.content = `게시글 본문입니다.`;
      savedPost = await postRepository.save(post);
    });

    describe('게시글 수정 실패', () => {
      test('존재하지 않는 게시글을 수정 요청시 404 응답', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id + 999}`)
          .send({
            author: '루비',
            password,
            title: '게시글 수정 테스트',
            content: '게시글 수정 테스트 본문',
          })
          .expect(404);

        return expect(res.body.message).toEqual(
          new PostNotFoundException().message,
        );
      });

      test('작성자 명이 빈 문자열일 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '',
            password,
            title: '게시글 수정 테스트',
            content: '게시글 수정 테스트 본문',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.AUTHOR_NOT_EMPTY,
        );
      });

      test('비밀번호가 일치하지 않을 경우 403 응답', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '루비',
            password: 'qwer1asd',
            title: '게시글 수정 테스트',
            content: '게시글 수정 테스트 본문',
          })
          .expect(403);

        return expect(res.body.message).toEqual(
          new PasswordMismatchException().message,
        );
      });

      test('게시글 제목이 2글자 미만일 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '루비',
            password,
            title: '게',
            content: '게시글 수정 테스트 본문',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.TITLE_MIN_LENGTH,
        );
      });

      test('게시글 제목이 20글자 초과일 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '루비',
            password,
            title:
              '게시글 제목 게시글 제목 게시글 제목 게시글 제목 게시글 제목 ',
            content: '게시글 수정 테스트 본문',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.TITLE_MAX_LENGTH,
        );
      });

      test('게시글 본문이 2글자 미만일 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '루비',
            password,
            title: '게시글 등록 테스트',
            content: '게',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.CONTENT_MIN_LENGTH,
        );
      });

      test('게시글 본문이 200 글자 초과일 경우 400 응답', async () => {
        let content = '';
        for (let i = 0; i < 30; i++) {
          content += '게시글 등록 테스트 본문';
        }

        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '루비',
            password,
            title: '게시글 제목',
            content,
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.CONTENT_MAX_LENGTH,
        );
      });

      test('비밀번호를 제외한 모든 필드가 빈 문자열일 경우 400 응답', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '',
            password,
            title: '',
            content: '',
          })
          .expect(400);

        await expect(res.body.message.length).toEqual(3);
        await expect(res.body.message).toContain(
          PostErrorMessage.AUTHOR_NOT_EMPTY,
        );
        await expect(res.body.message).toContain(
          PostErrorMessage.TITLE_MIN_LENGTH,
        );
        await expect(res.body.message).toContain(
          PostErrorMessage.CONTENT_MIN_LENGTH,
        );
      });
    });

    test('게시글 수정 성공', async () => {
      return request(app.getHttpServer())
        .put(`/api/posts/${savedPost.id}`)
        .send({
          author: '루비',
          password,
          title: '게시글 수정 테스트',
          content: '게시글 수정 테스트 본문',
        })
        .expect(204);
    });
  });

  describe('/PUT /api/posts/:id', () => {
    let savedPost;
    const password = '1234qwer';

    beforeAll(async () => {
      await postRepository.delete({});

      const post = new Post();
      post.author = `작성자`;
      post.password = await bcrypt.hash(password, 12);
      post.title = `게시글`;
      post.content = `게시글 본문입니다.`;
      savedPost = await postRepository.save(post);
    });

    describe('게시글 삭제 실패', () => {
      test('존재하지 않는 게시글을 삭제 요청시 404 응답', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/api/posts/${savedPost.id + 999}`)
          .send({ password })
          .expect(404);

        return expect(res.body.message).toEqual(
          new PostNotFoundException().message,
        );
      });

      test('비밀번호가 일치하지 않을 경우 403 응답', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/api/posts/${savedPost.id}`)
          .send({ password: 'qwer1asd' })
          .expect(403);

        return expect(res.body.message).toEqual(
          new PasswordMismatchException().message,
        );
      });
    });

    test('게시글 삭제 성공', async () => {
      return request(app.getHttpServer())
        .delete(`/api/posts/${savedPost.id}`)
        .send({ password })
        .expect(204);
    });
  });
});
