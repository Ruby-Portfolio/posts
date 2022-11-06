import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CustomRepository } from '../../module/typeOrm/customRepository.decorator';
import {
  containsCondition,
  ltCondition,
} from '../../common/queryBrackets/queryBrackets';
import { GetPostsDto } from './post.request.dto';

@CustomRepository(Post)
export class PostRepository extends Repository<Post> {
  /**
   * 게시글 검색
   * @param beforeLastId 이전에 조회한 게시글 목록의 마지막 Id
   * @param keyword 검색어
   */
  async getPosts({ beforeLastId, keyword = '' }: GetPostsDto) {
    const take = 20;
    const postAlias = Post.alias;

    return this.createQueryBuilder(postAlias.entity)
      .where(ltCondition(postAlias.id, beforeLastId))
      .andWhere(
        containsCondition([postAlias.title, postAlias.content], keyword),
      )
      .take(take)
      .orderBy(postAlias.id, 'DESC')

      .getMany();
  }
}
