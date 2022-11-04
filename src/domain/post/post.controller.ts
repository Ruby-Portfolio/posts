import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AddPostDto, GetPostsDto } from './post.request.dto';
import { PostService } from './post.service';
import { CurrentQuery } from '../../common/decorator/param.decorator';
import { PostsResponse } from './post.response.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async addPost(@Body() addPost: AddPostDto, @Res() res): Promise<void> {
    await this.postService.addPost(addPost);
    return res.status(HttpStatus.CREATED).send();
  }

  @Get()
  async getPosts(
    @CurrentQuery() getPosts: GetPostsDto,
  ): Promise<PostsResponse> {
    const posts = await this.postService.getPosts(getPosts);
    return new PostsResponse(posts);
  }
}
