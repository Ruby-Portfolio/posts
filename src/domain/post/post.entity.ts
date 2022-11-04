import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { IsPassword } from '../../common/validation/IsPassword.validation';
import { PostErrorMessage } from './post.error.message';

@Entity()
export class Post {
  static alias = {
    entity: 'post',
    id: 'post.id',
    author: 'post.author',
    password: 'post.password',
    title: 'post.title',
    content: 'post.content',
  };

  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty({ message: PostErrorMessage.AUTHOR_NOT_EMPTY })
  @Column()
  author: string;

  @IsPassword({ min: 6, max: 50 })
  @Column()
  password: string;

  @MinLength(2, { message: PostErrorMessage.TITLE_MIN_LENGTH })
  @MaxLength(20, { message: PostErrorMessage.TITLE_MAX_LENGTH })
  @Column({ length: 20 })
  title: string;

  @MinLength(2, { message: PostErrorMessage.CONTENT_MIN_LENGTH })
  @MaxLength(20, { message: PostErrorMessage.CONTENT_MAX_LENGTH })
  @Column({ length: 200 })
  content: string;
}
