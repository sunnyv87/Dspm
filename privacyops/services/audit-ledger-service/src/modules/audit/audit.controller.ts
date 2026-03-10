import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Response } from 'express';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private service: AuditService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.createEntry(data);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.findByTenant(tenantId, {
      page,
      pageSize,
      action,
      entityType,
      userId,
      startDate,
      endDate,
    });
  }

  @Get('search')
  search(
    @Query('tenantId') tenantId: string,
    @Query('q') query: string,
  ) {
    return this.service.search(tenantId, query);
  }

  @Get('export')
  async exportEntries(
    @Query('tenantId') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format: 'json' | 'csv',
    @Res() res: Response,
  ) {
    const result = await this.service.exportEntries(
      tenantId,
      startDate,
      endDate,
      format || 'json',
    );
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=audit-log.csv',
      );
      res.send(result);
    } else {
      res.json(result);
    }
  }

  @Post('retention/execute')
  executeRetention() {
    return this.service.applyRetention();
  }
}
