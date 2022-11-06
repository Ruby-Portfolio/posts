import { setSeederFactory } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { Post } from '../../domain/post/post.entity';

export default setSeederFactory(Post, async (faker) => {
  const post = new Post();
  const password = '1234qwer';
  post.author = faker.name.fullName({ gender: 'male' });
  post.password = await bcrypt.hash(password, 12);
  post.title = faker.lorem.word({ length: 15 });
  post.content = faker.lorem.lines(1);

  return post;
});
