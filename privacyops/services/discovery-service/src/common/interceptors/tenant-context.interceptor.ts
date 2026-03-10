import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Extract tenant context from header if not already set by JWT
    if (!request.user?.tenantId) {
      const headerTenantId = request.headers['x-tenant-id'];
      if (headerTenantId && request.user) {
        request.user.tenantId = headerTenantId;
      }
    }

    return next.handle();
  }
}
