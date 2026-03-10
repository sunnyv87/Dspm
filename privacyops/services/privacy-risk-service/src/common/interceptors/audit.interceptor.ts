import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const user = request.user;
    const startTime = Date.now();

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log({
            message: 'Audit log',
            method,
            url,
            userId: user?.userId,
            tenantId: user?.tenantId,
            email: user?.email,
            duration: `${duration}ms`,
            status: 'success',
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.warn({
            message: 'Audit log',
            method,
            url,
            userId: user?.userId,
            tenantId: user?.tenantId,
            email: user?.email,
            duration: `${duration}ms`,
            status: 'error',
            error: error.message,
          });
        },
      }),
    );
  }
}
