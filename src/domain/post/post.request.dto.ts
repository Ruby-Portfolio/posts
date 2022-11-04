import { PickType } from '@nestjs/swagger';
import { Post } from './post.entity';
import { IsOptionalId } from '../../common/validation/IsOptionalId.validation';
import { IsOptional } from 'class-validator';

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
  'password',
  'title',
  'content',
] as const) {}
