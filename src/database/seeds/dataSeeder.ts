import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Post } from '../../domain/post/post.entity';

export default class DataSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const postRepository = dataSource.getRepository(Post);

    await postRepository.delete({});

    const postFactory = await factoryManager.get(Post);
    await postFactory.saveMany(45);
  }
}
