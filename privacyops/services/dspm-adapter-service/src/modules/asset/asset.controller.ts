import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DspmClientService } from '../dspm-client/dspm-client.service';

@ApiTags('DSPM Assets')
@Controller('assets')
export class AssetController {
  constructor(private dspmClient: DspmClientService) {}

  @Get()
  list(@Query() params: Record<string, any>) { return this.dspmClient.listAssets(params); }

  @Get(':id')
  get(@Param('id') id: string) { return this.dspmClient.getAsset(id); }
}
