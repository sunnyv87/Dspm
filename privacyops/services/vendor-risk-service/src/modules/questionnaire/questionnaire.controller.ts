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
import { QuestionnaireService } from './questionnaire.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { QuestionnaireStatus } from '../../entities/vendor-questionnaire.entity';

@ApiTags('Questionnaires')
@ApiBearerAuth('bearer')
@Controller('questionnaires')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Post()
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Create a new vendor questionnaire' })
  @ApiResponse({ status: 201, description: 'Questionnaire created successfully' })
  @ApiResponse({ status: 404, description: 'Vendor or assessment not found' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateQuestionnaireDto,
  ) {
    return this.questionnaireService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List questionnaires for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of questionnaires' })
  async findAll(
    @TenantId() tenantId: string,
    @Query('vendorId') vendorId?: string,
    @Query('assessmentId') assessmentId?: string,
    @Query('status') status?: QuestionnaireStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.questionnaireService.findAll(tenantId, vendorId, assessmentId, status, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a questionnaire by ID' })
  @ApiResponse({ status: 200, description: 'Questionnaire found' })
  @ApiResponse({ status: 404, description: 'Questionnaire not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionnaireService.findById(tenantId, id);
  }

  @Post(':id/send')
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Send a questionnaire to the vendor' })
  @ApiResponse({ status: 200, description: 'Questionnaire sent' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Questionnaire not found' })
  async send(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionnaireService.send(tenantId, id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit responses to a questionnaire' })
  @ApiResponse({ status: 200, description: 'Responses submitted' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Questionnaire not found' })
  async submitResponses(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitResponseDto,
  ) {
    return this.questionnaireService.submitResponses(tenantId, id, dto);
  }

  @Post(':id/review')
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Mark a questionnaire as reviewed' })
  @ApiResponse({ status: 200, description: 'Questionnaire marked as reviewed' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Questionnaire not found' })
  async markReviewed(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionnaireService.markReviewed(tenantId, id);
  }

  @Delete(':id')
  @Permissions('vendor-risk.manage')
  @ApiOperation({ summary: 'Delete a questionnaire' })
  @ApiResponse({ status: 200, description: 'Questionnaire deleted' })
  @ApiResponse({ status: 404, description: 'Questionnaire not found' })
  async delete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.questionnaireService.delete(tenantId, id);
    return { deleted: true };
  }
}
