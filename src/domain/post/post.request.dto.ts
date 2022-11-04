import { PickType } from '@nestjs/swagger';
import { Post } from './post.entity';
import { IsId } from '../../common/validation/IsId.validation';

export class AddPostDto extends PickType(Post, [
  'author',
  'password',
  'title',
  'content',
] as const) {}

export class GetPostsDto {
  @IsId()
  beforeLastId: number | null;

  keyword: string;
}
