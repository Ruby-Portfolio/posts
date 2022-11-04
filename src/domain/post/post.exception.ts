import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

export class PostNotFoundException extends HttpException {
  constructor() {
    super('게시글 정보를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
  }
}

export class PasswordMismatchException extends HttpException {
  constructor() {
    super('비밀번호가 맞지 않습니다.', HttpStatus.FORBIDDEN);
  }
}
