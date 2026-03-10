import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';
import { RequestUser } from '../decorators/current-user.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser;

    if (!user) {
      return false;
    }

    // Super admin can access any tenant
    if (user.role === 'super_admin') {
      return true;
    }

    // Check route params for tenantId
    const paramTenantId = request.params?.tenantId;
    if (paramTenantId && paramTenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied: tenant mismatch');
    }

    // Check query params for tenantId
    const queryTenantId = request.query?.tenantId;
    if (queryTenantId && queryTenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied: tenant mismatch');
    }

    // Check body for tenantId
    const bodyTenantId = request.body?.tenantId;
    if (bodyTenantId && bodyTenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied: tenant mismatch');
    }

    return true;
  }
}
