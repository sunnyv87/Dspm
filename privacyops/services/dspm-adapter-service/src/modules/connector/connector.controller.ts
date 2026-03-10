import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DspmClientService } from '../dspm-client/dspm-client.service';

@ApiTags('DSPM Connectors')
@Controller('connectors')
export class ConnectorController {
  constructor(private dspmClient: DspmClientService) {}

  @Get()
  list(@Query() params: Record<string, any>) { return this.dspmClient.listConnectors(params); }

  @Get(':id')
  get(@Param('id') id: string) { return this.dspmClient.getConnector(id); }

  @Post()
  create(@Body() payload: any) { return this.dspmClient.createConnector(payload); }

  @Post('test')
  test(@Body() payload: any) { return this.dspmClient.testConnector(payload); }

  @Get(':id/health')
  health(@Param('id') id: string) { return this.dspmClient.getConnectorHealth(id); }
}
