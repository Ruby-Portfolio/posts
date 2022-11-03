import { PickType } from '@nestjs/swagger';
import { Post } from './post.entity';

export class AddPostDto extends PickType(Post, [
  'author',
  'password',
  'title',
  'content',
] as const) {}
