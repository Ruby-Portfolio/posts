import { PickType } from '@nestjs/swagger';
import { Post } from './post.entity';
import { IsOptionalId } from '../../common/validation/IsOptionalId.validation';
import { IsOptional, IsString } from 'class-validator';
import { PostErrorMessage } from './post.error.message';

export class AddPostDto extends PickType(Post, [
  'author',
  'password',
  'title',
  'content',
] as const) {}

export class GetPostsDto {
  @IsOptionalId()
  beforeLastId: number;

  @IsOptional()
  keyword: string;
}

export class UpdatePostDto extends PickType(Post, [
  'author',
  'title',
  'content',
] as const) {
  @IsString({ message: PostErrorMessage.PASSWORD })
  password: string;
}
