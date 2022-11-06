import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { CustomTypeOrmModule } from '../../module/typeOrm/customTypeOrm.module';
import { PostRepository } from './post.repository';

@Module({
  imports: [CustomTypeOrmModule.forCustomRepository([PostRepository])],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
