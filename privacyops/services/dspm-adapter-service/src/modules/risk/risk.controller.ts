import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DspmClientService } from '../dspm-client/dspm-client.service';

@ApiTags('DSPM Risk')
@Controller('risk')
export class RiskController {
  constructor(private dspmClient: DspmClientService) {}

  @Get('scores')
  listScores(@Query() params: Record<string, any>) { return this.dspmClient.getRiskScores(params); }

  @Get('scores/:assetId')
  getScore(@Param('assetId') assetId: string) { return this.dspmClient.getRiskScore(assetId); }
}
