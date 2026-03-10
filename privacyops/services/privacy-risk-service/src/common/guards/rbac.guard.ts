import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.permissions)
      throw new ForbiddenException('Insufficient permissions');
    if (user.role === 'super_admin') return true;

    const hasAll = requiredPermissions.every((p) =>
      user.permissions.includes(p),
    );
    if (!hasAll)
      throw new ForbiddenException(
        `Missing permissions: ${requiredPermissions.filter((p) => !user.permissions.includes(p)).join(', ')}`,
      );

    return true;
  }
}
