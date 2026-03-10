import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    if (!user || !user.tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }

    // If tenantId is provided as a query parameter, ensure it matches the user's tenant
    const queryTenantId = request.query.tenantId as string;
    if (queryTenantId && queryTenantId !== user.tenantId) {
      this.logger.warn(
        `Tenant mismatch: user tenant=${user.tenantId}, requested tenant=${queryTenantId}`,
      );
      throw new ForbiddenException(
        'Access denied: tenant mismatch',
      );
    }

    // Set tenantId on request for downstream use
    (request as any).tenantId = user.tenantId;

    return true;
  }
}
