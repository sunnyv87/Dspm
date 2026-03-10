import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalService } from './approval.service';
import { SubmitApprovalDto } from './dto/submit-approval.dto';
import { QueryApprovalDto } from './dto/query-approval.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Approvals')
@ApiBearerAuth('bearer')
@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post()
  @Permissions('workflow.approve')
  @ApiOperation({ summary: 'Submit an approval decision' })
  @ApiResponse({ status: 201, description: 'Approval submitted successfully' })
  @ApiResponse({ status: 404, description: 'Task or instance not found' })
  @ApiResponse({ status: 400, description: 'Task cannot be approved' })
  async submit(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: SubmitApprovalDto,
  ) {
    return this.approvalService.submit(tenantId, user.userId, user.email, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List approval records for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of approval records' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryApprovalDto,
  ) {
    return this.approvalService.findAll(tenantId, query);
  }

  @Get('my-approvals')
  @ApiOperation({ summary: 'List approval records submitted by the current user' })
  @ApiResponse({ status: 200, description: 'Paginated list of user approval records' })
  async getMyApprovals(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Query() query: QueryApprovalDto,
  ) {
    return this.approvalService.getMyApprovals(tenantId, user.userId, query);
  }

  @Get('pending')
  @ApiOperation({ summary: 'List pending approval tasks assigned to the current user' })
  @ApiResponse({ status: 200, description: 'Paginated list of pending approval tasks' })
  async getPendingApprovals(
    @TenantId() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Query() query: QueryApprovalDto,
  ) {
    return this.approvalService.getPendingApprovals(tenantId, user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an approval record by ID' })
  @ApiResponse({ status: 200, description: 'Approval record found' })
  @ApiResponse({ status: 404, description: 'Approval record not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.approvalService.findById(tenantId, id);
  }
}
