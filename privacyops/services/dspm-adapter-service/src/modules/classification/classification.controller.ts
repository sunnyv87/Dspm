import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DspmClientService } from '../dspm-client/dspm-client.service';

@ApiTags('DSPM Classification')
@Controller('classification')
export class ClassificationController {
  constructor(private dspmClient: DspmClientService) {}

  @Get('results')
  listResults(@Query() params: Record<string, any>) { return this.dspmClient.listClassificationResults(params); }

  @Get('rules')
  listRules(@Query() params: Record<string, any>) { return this.dspmClient.listClassificationRules(params); }
}
