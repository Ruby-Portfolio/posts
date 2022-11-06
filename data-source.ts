import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import * as dotenv from 'dotenv';
import { Post } from './src/domain/post/post.entity';

dotenv.config();
const options: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: 'localhost',
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Post],
  charset: 'utf8mb4',
  synchronize: true,
  logging: true,

  seeds: ['src/database/seeds/**/*{.ts,.js}'],
  factories: ['src/database/factories/**/*{.ts,.js}'],
};

export const dataSource = new DataSource(options);
