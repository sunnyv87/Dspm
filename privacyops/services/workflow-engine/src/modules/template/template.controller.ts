import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TemplateService } from './template.service';

@ApiTags('Workflow Templates')
@Controller('templates')
export class TemplateController {
  constructor(private service: TemplateService) {}

  @Get()
  findAll(@Query('tenantId') tenantId?: string) { return this.service.findAll(tenantId); }

  @Get(':id')
  findById(@Param('id') id: string) { return this.service.findById(id); }

  @Post()
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

  @Delete(':id')
  delete(@Param('id') id: string) { return this.service.delete(id); }

  @Post('seed')
  seed() { return this.service.seedDefaults(); }
}
