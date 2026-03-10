import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DspmIntegrationService } from './dspm-integration.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('DSPM Integration')
@ApiBearerAuth('bearer')
@Controller('dspm')
export class DspmIntegrationController {
  constructor(
    private readonly dspmIntegrationService: DspmIntegrationService,
  ) {}

  @Get('posture')
  @Permissions('compliance.scan.read')
  @ApiOperation({
    summary: 'Get DSPM posture summary for compliance context',
    description:
      'Aggregates data from the DSPM adapter service including discovered assets, ' +
      'classification results, risk scores, policy violations, and security alerts.',
  })
  @ApiResponse({ status: 200, description: 'DSPM posture summary' })
  async getPostureSummary(
    @Headers('authorization') authorization?: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.dspmIntegrationService.getDspmPostureSummary(token);
  }

  @Get('assets')
  @Permissions('compliance.scan.read')
  @ApiOperation({ summary: 'Get discovered data assets from DSPM' })
  @ApiResponse({ status: 200, description: 'List of discovered assets' })
  async getAssets(@Headers('authorization') authorization?: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.dspmIntegrationService.getDiscoveredAssets(token);
  }

  @Get('classifications')
  @Permissions('compliance.scan.read')
  @ApiOperation({ summary: 'Get data classification results from DSPM' })
  @ApiResponse({ status: 200, description: 'Classification results' })
  async getClassifications(@Headers('authorization') authorization?: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.dspmIntegrationService.getClassificationResults(token);
  }

  @Get('risk-scores')
  @Permissions('compliance.scan.read')
  @ApiOperation({ summary: 'Get risk scores from DSPM' })
  @ApiResponse({ status: 200, description: 'Risk score data' })
  async getRiskScores(@Headers('authorization') authorization?: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.dspmIntegrationService.getRiskScores(token);
  }

  @Get('violations')
  @Permissions('compliance.scan.read')
  @ApiOperation({ summary: 'Get policy violations from DSPM' })
  @ApiResponse({ status: 200, description: 'Policy violations' })
  async getViolations(@Headers('authorization') authorization?: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.dspmIntegrationService.getPolicyViolations(token);
  }
}
