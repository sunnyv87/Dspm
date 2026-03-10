import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { ActivityService } from './activity.service';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { TenantContextInterceptor } from '../../common/interceptors/tenant-context.interceptor';

@ApiTags('activity')
@ApiBearerAuth()
@UseInterceptors(TenantContextInterceptor, AuditInterceptor)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('recent')
  @Permissions('dashboard:read')
  @ApiOperation({ summary: 'Get recent activity across all services' })
  @ApiOkResponse({ description: 'List of recent activity entries' })
  async getRecent(@Req() request: Request) {
    const token = this.extractToken(request);
    return this.activityService.getRecent(token);
  }

  @Get('timeline')
  @Permissions('dashboard:read')
  @ApiOperation({ summary: 'Get activity timeline' })
  @ApiOkResponse({ description: 'Activity timeline with aggregated events' })
  async getTimeline(@Req() request: Request) {
    const token = this.extractToken(request);
    return this.activityService.getTimeline(token);
  }

  @Get('user-activity')
  @Permissions('dashboard:read')
  @ApiOperation({ summary: 'Get activity by current user' })
  @ApiOkResponse({ description: 'Activity entries for the authenticated user' })
  async getUserActivity(
    @CurrentUser() user: RequestUser,
    @Req() request: Request,
  ) {
    const token = this.extractToken(request);
    return this.activityService.getUserActivity(user.userId, token);
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return undefined;
  }
}
