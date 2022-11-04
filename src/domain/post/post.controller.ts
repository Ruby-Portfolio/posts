import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AddPostDto } from './post.request.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async addPost(@Body() addPost: AddPostDto, @Res() res): Promise<void> {
    await this.postService.addPost(addPost);
    return res.status(HttpStatus.CREATED).send();
  }
}
