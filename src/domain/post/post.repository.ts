import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CustomRepository } from '../../module/typeOrm/customRepository.decorator';

@CustomRepository(Post)
export class PostRepository extends Repository<Post> {}
