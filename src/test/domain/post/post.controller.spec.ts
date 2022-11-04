import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../../domain/post/post.entity';
import { PostRepository } from '../../../domain/post/post.repository';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { CustomTypeOrmModule } from '../../../module/typeOrm/customTypeOrm.module';
import { PostModule } from '../../../domain/post/post.module';
import { validationPipe } from '../../../pipe/validation.pipe';
import { PostMessage } from '../../../domain/post/post.message';

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
          dropSchema: true,
          logging: true,
        }),
        PostModule,
        CustomTypeOrmModule.forCustomRepository([PostRepository]),
      ],
    }).compile();

    app = module.createNestApplication();
    validationPipe(app);
    await app.init();

    postRepository = module.get<PostRepository>(PostRepository);
  });

  describe('/POST posts', () => {
    test('작성자 명이 빈 문자열일 경우 400 응답', async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .send({
          author: '',
          password: '1234qwer',
          title: '게시글 등록 테스트',
          content: '게시글 등록 테스트 본문',
        })
        .expect(400);

      expect(res.body.message[0]).toEqual(PostMessage.AUTHOR_NOT_EMPTY);
    });

    test('작성자 명이 빈 문자열일 경우 400 응답', async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .send({
          author: '',
          password: '1234qwer',
          title: '게시글 등록 테스트',
          content: '게시글 등록 테스트 본문',
        })
        .expect(400);

      expect(res.body.message[0]).toEqual(PostMessage.AUTHOR_NOT_EMPTY);
    });

    test('비밀번호가 6글자 미만일 경우 400 응답', async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .send({
          author: '루비',
          password: 'qwer1',
          title: '게시글 등록 테스트',
          content: '게시글 등록 테스트 본문',
        })
        .expect(400);

      expect(res.body.message[0]).toEqual(PostMessage.PASSWORD);
    });

    test('비밀번호에 숫자가 포함되어 있지 않을 경우 400 응답', async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .send({
          author: '루비',
          password: 'qwerqwe',
          title: '게시글 등록 테스트',
          content: '게시글 등록 테스트 본문',
        })
        .expect(400);

      expect(res.body.message[0]).toEqual(PostMessage.PASSWORD);
    });

    test('게시글 제목이 2글자 미만일 경우 400 응답', async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .send({
          author: '루비',
          password: 'qwerqwe12',
          title: '게',
          content: '게시글 등록 테스트 본문',
        })
        .expect(400);

      expect(res.body.message[0]).toEqual(PostMessage.TITLE_MIN_LENGTH);
    });

    test('게시글 제목이 20글자 초과일 경우 400 응답', async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .send({
          author: '루비',
          password: 'qwerqwe12',
          title: '게시글 제목 게시글 제목 게시글 제목 게시글 제목 게시글 제목 ',
          content: '게시글 등록 테스트 본문',
        })
        .expect(400);

      expect(res.body.message[0]).toEqual(PostMessage.TITLE_MAX_LENGTH);
    });

    test('게시글 본문이 2글자 미만일 경우 400 응답', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          author: '루비',
          password: '1234qwer',
          title: '게시글 등록 테스트',
          content: '게',
        })
        .expect(400);
    });

    test('게시글 본문이 200 글자 초과일 경우 400 응답', async () => {
      let content = '';
      for (let i = 0; i < 30; i++) {
        content += '게시글 등록 테스트 본문';
      }

      const res = await request(app.getHttpServer())
        .post('/posts')
        .send({
          author: '루비',
          password: 'qwerqwe12',
          title: '게시글 제목 게시글 제목 게시글 제목 게시글 제목 게시글 제목 ',
          content,
        })
        .expect(400);

      expect(res.body.message[0]).toEqual(PostMessage.TITLE_MAX_LENGTH);
    });

    test('모든 필드 값이 빈 문자열일 경우 400 응답', async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .send({
          author: '',
          password: '',
          title: '',
          content: '',
        })
        .expect(400);

      expect(res.body.message.length).toEqual(4);
      expect(res.body.message).toContain(PostMessage.AUTHOR_NOT_EMPTY);
      expect(res.body.message).toContain(PostMessage.PASSWORD);
      expect(res.body.message).toContain(PostMessage.TITLE_MIN_LENGTH);
      expect(res.body.message).toContain(PostMessage.CONTENT_MIN_LENGTH);
    });

    test('게시글 등록 성공', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          author: '루비',
          password: '1234qwer',
          title: '게시글 등록 테스트',
          content: '게시글 등록 테스트 본문',
        })
        .expect(201);
    });
  });
});
