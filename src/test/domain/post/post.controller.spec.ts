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
    describe('????????? ?????? ??????', () => {
      test('????????? ?????? ??? ???????????? ?????? 400 ??????', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '',
            password: '1234qwer',
            title: '????????? ?????? ?????????',
            content: '????????? ?????? ????????? ??????',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.AUTHOR_NOT_EMPTY,
        );
      });

      test('??????????????? 6?????? ????????? ?????? 400 ??????', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '??????',
            password: 'qwer1',
            title: '????????? ?????? ?????????',
            content: '????????? ?????? ????????? ??????',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(PostErrorMessage.PASSWORD);
      });

      test('??????????????? ????????? ???????????? ?????? ?????? ?????? 400 ??????', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '??????',
            password: 'qwerqwe',
            title: '????????? ?????? ?????????',
            content: '????????? ?????? ????????? ??????',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(PostErrorMessage.PASSWORD);
      });

      test('????????? ????????? 2?????? ????????? ?????? 400 ??????', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '??????',
            password: 'qwerqwe12',
            title: '???',
            content: '????????? ?????? ????????? ??????',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.TITLE_MIN_LENGTH,
        );
      });

      test('????????? ????????? 20?????? ????????? ?????? 400 ??????', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '??????',
            password: 'qwerqwe12',
            title:
              '????????? ?????? ????????? ?????? ????????? ?????? ????????? ?????? ????????? ?????? ',
            content: '????????? ?????? ????????? ??????',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.TITLE_MAX_LENGTH,
        );
      });

      test('????????? ????????? 2?????? ????????? ?????? 400 ??????', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '??????',
            password: '1234qwer',
            title: '????????? ?????? ?????????',
            content: '???',
          })
          .expect(400);
        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.CONTENT_MIN_LENGTH,
        );
      });

      test('????????? ????????? 200 ?????? ????????? ?????? 400 ??????', async () => {
        let content = '';
        for (let i = 0; i < 30; i++) {
          content += '????????? ?????? ????????? ??????';
        }

        const res = await request(app.getHttpServer())
          .post('/api/posts')
          .send({
            author: '??????',
            password: 'qwerqwe12',
            title: '????????? ??????',
            content,
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.CONTENT_MAX_LENGTH,
        );
      });

      test('?????? ?????? ?????? ??? ???????????? ?????? 400 ??????', async () => {
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

    test('????????? ?????? ??????', async () => {
      return request(app.getHttpServer())
        .post('/api/posts')
        .send({
          author: '??????',
          password: '1234qwer',
          title: '????????? ?????? ?????????',
          content: '????????? ?????? ????????? ??????',
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
        post.author = `?????????${i}`;
        post.password = await bcrypt.hash(password, 12);
        post.title = `?????????${i}`;
        post.content = `????????? ${i}?????? ???????????????.`;
        posts.push(post);
      }
      await postRepository.save(posts);
    }, 25000);

    describe('????????? ?????? ?????? ??????', () => {
      test('?????? ????????? ?????? ????????? id ?????? ????????? ?????? ?????? 400 ??????', async () => {
        const err = await request(app.getHttpServer())
          .get('/api/posts')
          .query({
            beforeLastId: '????????????',
          })
          .expect(400);

        return expect(err.body.message).toContain(
          CommonErrorMessage.ID_INVALID,
        );
      });
    });

    describe('????????? ?????? ?????? ??????', () => {
      test('?????? ????????? ????????? ????????? ?????? ?????? ??????', async () => {
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

      test('???????????? ???????????? ????????? ?????? ??????', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/posts')
          .query({ keyword: '????????? 2' })
          .expect(200);

        await expect(
          res.body.posts.every((post) => {
            return (
              post.title.indexOf('?????????') ||
              post.title.indexOf('2') ||
              post.content.indexOf('?????????') ||
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

      test('?????? ?????? ????????? ????????? ????????? ????????? ?????? ????????? ???????????? ???????????? ????????? ?????? ??????', async () => {
        const beforeLastPost = await postRepository
          .createQueryBuilder(Post.alias.entity)
          .where(containsCondition([Post.alias.title], '????????? 20'))
          .getOne();
        const beforeLastId = beforeLastPost.id;

        const res = await request(app.getHttpServer())
          .get('/api/posts')
          .query({ beforeLastId, keyword: '????????? 2' })
          .expect(200);

        await expect(
          res.body.posts.every((post) => {
            return (
              post.id < beforeLastId &&
              (post.title.indexOf('?????????') ||
                post.title.indexOf('2') ||
                post.content.indexOf('?????????') ||
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

      test('???????????? ?????? ????????? ?????? ??????', async () => {
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
      post.author = `?????????`;
      post.password = await bcrypt.hash(password, 12);
      post.title = `?????????`;
      post.content = `????????? ???????????????.`;
      savedPost = await postRepository.save(post);
    });

    describe('????????? ?????? ?????? ??????', () => {
      test('???????????? ?????? ???????????? ?????? ????????? 404 ??????', async () => {
        const id = savedPost.id + 999;
        const err = await request(app.getHttpServer())
          .get(`/api/posts/${id}`)
          .expect(404);

        return expect(err.body.message).toContain(
          new PostNotFoundException().message,
        );
      });

      test('????????? id ????????? ????????? ?????? ????????? 400 ??????', async () => {
        const err = await request(app.getHttpServer())
          .get(`/api/posts/asd`)
          .expect(400);

        return expect(err.body.message).toContain(
          new InvalidIdException().message,
        );
      });
    });

    test('????????? ?????? ?????? ??????', async () => {
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
      post.author = `?????????`;
      post.password = await bcrypt.hash(password, 12);
      post.title = `?????????`;
      post.content = `????????? ???????????????.`;
      savedPost = await postRepository.save(post);
    });

    describe('????????? ?????? ??????', () => {
      test('???????????? ?????? ???????????? ?????? ????????? 404 ??????', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id + 999}`)
          .send({
            author: '??????',
            password,
            title: '????????? ?????? ?????????',
            content: '????????? ?????? ????????? ??????',
          })
          .expect(404);

        return expect(res.body.message).toEqual(
          new PostNotFoundException().message,
        );
      });

      test('????????? ?????? ??? ???????????? ?????? 400 ??????', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '',
            password,
            title: '????????? ?????? ?????????',
            content: '????????? ?????? ????????? ??????',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.AUTHOR_NOT_EMPTY,
        );
      });

      test('??????????????? ???????????? ?????? ?????? 403 ??????', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '??????',
            password: 'qwer1asd',
            title: '????????? ?????? ?????????',
            content: '????????? ?????? ????????? ??????',
          })
          .expect(403);

        return expect(res.body.message).toEqual(
          new PasswordMismatchException().message,
        );
      });

      test('????????? ????????? 2?????? ????????? ?????? 400 ??????', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '??????',
            password,
            title: '???',
            content: '????????? ?????? ????????? ??????',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.TITLE_MIN_LENGTH,
        );
      });

      test('????????? ????????? 20?????? ????????? ?????? 400 ??????', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '??????',
            password,
            title:
              '????????? ?????? ????????? ?????? ????????? ?????? ????????? ?????? ????????? ?????? ',
            content: '????????? ?????? ????????? ??????',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.TITLE_MAX_LENGTH,
        );
      });

      test('????????? ????????? 2?????? ????????? ?????? 400 ??????', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '??????',
            password,
            title: '????????? ?????? ?????????',
            content: '???',
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.CONTENT_MIN_LENGTH,
        );
      });

      test('????????? ????????? 200 ?????? ????????? ?????? 400 ??????', async () => {
        let content = '';
        for (let i = 0; i < 30; i++) {
          content += '????????? ?????? ????????? ??????';
        }

        const res = await request(app.getHttpServer())
          .put(`/api/posts/${savedPost.id}`)
          .send({
            author: '??????',
            password,
            title: '????????? ??????',
            content,
          })
          .expect(400);

        return expect(res.body.message[0]).toEqual(
          PostErrorMessage.CONTENT_MAX_LENGTH,
        );
      });

      test('??????????????? ????????? ?????? ????????? ??? ???????????? ?????? 400 ??????', async () => {
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

    test('????????? ?????? ??????', async () => {
      return request(app.getHttpServer())
        .put(`/api/posts/${savedPost.id}`)
        .send({
          author: '??????',
          password,
          title: '????????? ?????? ?????????',
          content: '????????? ?????? ????????? ??????',
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
      post.author = `?????????`;
      post.password = await bcrypt.hash(password, 12);
      post.title = `?????????`;
      post.content = `????????? ???????????????.`;
      savedPost = await postRepository.save(post);
    });

    describe('????????? ?????? ??????', () => {
      test('???????????? ?????? ???????????? ?????? ????????? 404 ??????', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/api/posts/${savedPost.id + 999}`)
          .send({ password })
          .expect(404);

        return expect(res.body.message).toEqual(
          new PostNotFoundException().message,
        );
      });

      test('??????????????? ???????????? ?????? ?????? 403 ??????', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/api/posts/${savedPost.id}`)
          .send({ password: 'qwer1asd' })
          .expect(403);

        return expect(res.body.message).toEqual(
          new PasswordMismatchException().message,
        );
      });
    });

    test('????????? ?????? ??????', async () => {
      return request(app.getHttpServer())
        .delete(`/api/posts/${savedPost.id}`)
        .send({ password })
        .expect(204);
    });
  });
});
