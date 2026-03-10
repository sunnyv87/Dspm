import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';

@ApiTags('Workflows')
@Controller()
export class WorkflowController {
  constructor(private service: WorkflowService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data.tenantId, data);
  }

  @Post('from-template')
  createFromTemplate(@Body() data: { tenantId: string; templateId: string; triggeredBy: string; contextData?: Record<string, unknown> }) {
    return this.service.createFromTemplate(data.tenantId, data.templateId, data.triggeredBy, data.contextData);
  }

  @Get()
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('tenantId') tenantId: string, @Query('status') status?: string) {
    return this.service.findByTenant(tenantId, status);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post(':workflowId/steps/:stepId/approve')
  approveStep(
    @Param('workflowId') workflowId: string,
    @Param('stepId') stepId: string,
    @Body() body: { userId: string; result?: Record<string, unknown> },
  ) {
    return this.service.approveStep(workflowId, stepId, body.userId, body.result);
  }

  @Post(':workflowId/steps/:stepId/reject')
  rejectStep(
    @Param('workflowId') workflowId: string,
    @Param('stepId') stepId: string,
    @Body() body: { userId: string; reason?: string },
  ) {
    return this.service.rejectStep(workflowId, stepId, body.userId, body.reason);
  }

  @Post(':workflowId/steps/:stepId/complete')
  completeStep(
    @Param('workflowId') workflowId: string,
    @Param('stepId') stepId: string,
    @Body() body: { result?: Record<string, unknown> },
  ) {
    return this.service.completeStep(workflowId, stepId, body.result);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.service.cancelWorkflow(id);
  }
}
