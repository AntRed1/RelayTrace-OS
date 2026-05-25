import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: id
          ? `${resource} with id ${id} not found`
          : `${resource} not found`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class ConflictException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
      },
      HttpStatus.CONFLICT,
    );
  }
}
