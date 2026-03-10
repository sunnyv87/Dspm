import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ConsentService } from './consent.service';
import { CaptureConsentDto } from './dto/capture-consent.dto';
import { WithdrawConsentDto } from './dto/withdraw-consent.dto';
import { QueryConsentDto } from './dto/query-consent.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Consent Records')
@Controller('consents')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post('capture')
  @Public()
  @ApiOperation({ summary: 'Capture consent (public or authenticated)' })
  @ApiResponse({ status: 201, description: 'Consent captured successfully' })
  @ApiResponse({ status: 404, description: 'Purpose or policy version not found' })
  async captureConsent(
    @Body() dto: CaptureConsentDto,
    @Req() req: Request,
  ) {
    // Auto-fill IP and user agent from request if not provided
    if (!dto.ipAddress) {
      dto.ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    }
    if (!dto.userAgent) {
      dto.userAgent = req.headers['user-agent'] || null;
    }

    return this.consentService.captureConsent(dto);
  }

  @Post('withdraw')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Withdraw consent' })
  @ApiResponse({ status: 200, description: 'Consent withdrawn successfully' })
  @ApiResponse({ status: 404, description: 'Consent record not found' })
  async withdrawConsent(
    @Body() dto: WithdrawConsentDto,
    @Req() req: Request,
  ) {
    if (!dto.ipAddress) {
      dto.ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    }
    if (!dto.userAgent) {
      dto.userAgent = req.headers['user-agent'] || null;
    }

    return this.consentService.withdrawConsent(dto);
  }

  @Get('subject/:subjectId')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get all consent records for a data subject' })
  @ApiResponse({ status: 200, description: 'Consent records for the subject' })
  async getSubjectConsents(
    @TenantId() tenantId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.consentService.getSubjectConsents(tenantId, subjectId);
  }

  @Get('audit/:subjectId')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get consent audit trail for a data subject' })
  @ApiResponse({ status: 200, description: 'Audit trail for the subject' })
  async getAuditTrail(
    @TenantId() tenantId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.consentService.getAuditTrail(tenantId, subjectId);
  }

  @Get('stats')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get consent analytics/stats for tenant' })
  @ApiResponse({ status: 200, description: 'Consent statistics' })
  async getStats(@TenantId() tenantId: string) {
    return this.consentService.getStats(tenantId);
  }

  @Get()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List consent records for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of consent records' })
  async listRecords(
    @TenantId() tenantId: string,
    @Query() query: QueryConsentDto,
  ) {
    return this.consentService.listRecords(tenantId, query);
  }

  @Get(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get a single consent record' })
  @ApiResponse({ status: 200, description: 'Consent record found' })
  @ApiResponse({ status: 404, description: 'Consent record not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.consentService.findById(tenantId, id);
  }
}
