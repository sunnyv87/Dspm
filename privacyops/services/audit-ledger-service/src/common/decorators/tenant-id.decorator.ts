import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    // Prefer the tenantId set by TenantGuard, fallback to user's tenantId
    return request.tenantId || request.user?.tenantId;
  },
);
