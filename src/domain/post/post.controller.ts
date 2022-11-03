import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AddPostDto } from './post.request.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async addPost(@Body() addPost: AddPostDto, @Res() res) {
    await this.postService.addPost(addPost);
    res.status(HttpStatus.CREATED);
  }
}
