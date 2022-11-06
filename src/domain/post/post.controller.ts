import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  AddPostDto,
  DeletePostDto,
  GetPostsDto,
  UpdatePostDto,
} from './post.request.dto';
import { PostService } from './post.service';
import { PostResponse, PostsResponse } from './post.response.dto';
import { IdPipe } from '../../common/pipe/validation.pipe';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * POST /api/posts
   * @param addPost 게시글 등록 정보
   * @param res 게시글 등록 성공 여부
   */
  @Post()
  async addPost(@Body() addPost: AddPostDto, @Res() res): Promise<void> {
    await this.postService.addPost(addPost);
    return res.status(HttpStatus.CREATED).send();
  }

  /**
   * GET /api/posts
   * @param getPosts 게시글 검색 조건
   */
  @Get()
  async getPosts(@Query() getPosts: GetPostsDto): Promise<PostsResponse> {
    const posts = await this.postService.getPosts(getPosts);
    return new PostsResponse(posts);
  }

  /**
   * GET /api/posts/:id
   * @param id 상세 조회할 게시글 Id
   */
  @Get(':id')
  async getPost(@Param('id', IdPipe) id: number): Promise<PostResponse> {
    const post = await this.postService.getPost(id);
    return new PostResponse(post);
  }

  /**
   * PUT /api/posts/:id
   * @param id 수정할 게시글 Id
   * @param updatePost 게시글 수정 정보
   * @param res 게시글 수정 성공 여부
   */
  @Put(':id')
  async updatePost(
    @Param('id', IdPipe) id: number,
    @Body() updatePost: UpdatePostDto,
    @Res() res,
  ): Promise<void> {
    await this.postService.updatePost(id, updatePost);
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  /**
   * DELETE /api/posts/:id
   * @param id 삭제할 게시글 Id
   * @param deletePost 게시글 삭제에 필요한 정보(비밀번호)
   * @param res 게시글 삭제 성공 여부
   */
  @Delete(':id')
  async deletePost(
    @Param('id', IdPipe) id: number,
    @Body() deletePost: DeletePostDto,
    @Res() res,
  ): Promise<void> {
    await this.postService.deletePost(id, deletePost);
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
