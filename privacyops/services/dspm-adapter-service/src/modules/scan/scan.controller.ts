import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DspmClientService } from '../dspm-client/dspm-client.service';

@ApiTags('DSPM Scans')
@Controller('scans')
export class ScanController {
  constructor(private dspmClient: DspmClientService) {}

  @Get()
  list(@Query() params: Record<string, any>) { return this.dspmClient.listScans(params); }

  @Get(':id')
  get(@Param('id') id: string) { return this.dspmClient.getScan(id); }

  @Post()
  create(@Body() payload: any) { return this.dspmClient.createScan(payload); }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) { return this.dspmClient.cancelScan(id); }
}
