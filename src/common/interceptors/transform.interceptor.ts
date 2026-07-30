import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface ResponseShape<T> {
  data: T;
  success: boolean;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseShape<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseShape<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === "object" && "success" in data) {
          return data;
        }
        return {
          data,
          success: true,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
