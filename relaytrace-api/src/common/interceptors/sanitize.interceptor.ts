/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const SENSITIVE_FIELDS = ['passwordHash', 'password', 'refreshToken'];

function sanitize(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([key]) => !SENSITIVE_FIELDS.includes(key))
        .map(([key, value]) => [key, sanitize(value)]),
    );
  }

  return obj;
}

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => sanitize(data)));
  }
}
