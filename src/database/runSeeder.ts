import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { Post } from '../domain/post/post.entity';

(async () => {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [Post],
    charset: 'utf8mb4',
    synchronize: true,
    logging: true,
  });
  await dataSource.initialize();

  await runSeeders(dataSource, {
    seeds: ['src/database/seeds/**/*{.ts,.js}'],
    factories: ['src/database/factories/**/*{.ts,.js}'],
  });
})();
