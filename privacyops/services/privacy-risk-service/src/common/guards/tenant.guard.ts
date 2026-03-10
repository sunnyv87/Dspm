import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;
    if (user.role === 'super_admin') return true;

    const paramTenantId = request.params?.tenantId;
    if (paramTenantId && paramTenantId !== user.tenantId)
      throw new ForbiddenException('Access denied: tenant mismatch');

    const queryTenantId = request.query?.tenantId;
    if (queryTenantId && queryTenantId !== user.tenantId)
      throw new ForbiddenException('Access denied: tenant mismatch');

    const bodyTenantId = request.body?.tenantId;
    if (bodyTenantId && bodyTenantId !== user.tenantId)
      throw new ForbiddenException('Access denied: tenant mismatch');

    return true;
  }
}
