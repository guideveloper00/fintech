import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../types/api-response.types';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T> | T> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      map((data: T): ApiSuccessResponse<T> | T => {
        if (this.isAlreadyFormatted(data)) {
          return data;
        }

        return {
          success: true,
          statusCode: response.statusCode,
          method: request.method,
          path: request.originalUrl,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private isAlreadyFormatted(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      'success' in value &&
      'timestamp' in value
    );
  }
}