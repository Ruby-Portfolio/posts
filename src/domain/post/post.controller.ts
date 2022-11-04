import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AddPostDto, GetPostsDto } from './post.request.dto';
import { PostService } from './post.service';
import { PostResponse, PostsResponse } from './post.response.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async addPost(@Body() addPost: AddPostDto, @Res() res): Promise<void> {
    await this.postService.addPost(addPost);
    return res.status(HttpStatus.CREATED).send();
  }

  @Get()
  async getPosts(@Query() getPosts: GetPostsDto): Promise<PostsResponse> {
    const posts = await this.postService.getPosts(getPosts);
    return new PostsResponse(posts);
  }

  @Get(':id')
  async getPost(@Query() id: number): Promise<PostResponse> {
    const post = await this.postService.getPost(id);
    return new PostResponse(post);
  }
}
