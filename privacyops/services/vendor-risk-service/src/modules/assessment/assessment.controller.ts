import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { QueryAssessmentDto } from './dto/query-assessment.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AssessmentStatus } from '../../entities/vendor-assessment.entity';

@ApiTags('Assessments')
@ApiBearerAuth('bearer')
@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Create a new vendor assessment' })
  @ApiResponse({ status: 201, description: 'Assessment created successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateAssessmentDto,
  ) {
    return this.assessmentService.create(tenantId, user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List assessments for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of assessments' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryAssessmentDto,
  ) {
    return this.assessmentService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an assessment by ID' })
  @ApiResponse({ status: 200, description: 'Assessment found' })
  @ApiResponse({ status: 404, description: 'Assessment not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assessmentService.findById(tenantId, id);
  }

  @Put(':id/status')
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Update assessment status' })
  @ApiResponse({ status: 200, description: 'Assessment status updated' })
  @ApiResponse({ status: 404, description: 'Assessment not found' })
  async updateStatus(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: AssessmentStatus; overallScore?: number; riskLevel?: string },
  ) {
    return this.assessmentService.updateStatus(tenantId, id, body.status, body.overallScore, body.riskLevel);
  }

  @Delete(':id')
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Delete an assessment' })
  @ApiResponse({ status: 200, description: 'Assessment deleted' })
  @ApiResponse({ status: 404, description: 'Assessment not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.assessmentService.delete(tenantId, id);
    return { deleted: true };
  }
}
