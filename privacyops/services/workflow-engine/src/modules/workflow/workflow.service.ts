import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowEntity } from '../../entities/workflow.entity';
import { WorkflowStepEntity } from '../../entities/workflow-step.entity';
import { WorkflowTemplateEntity } from '../../entities/workflow-template.entity';
import { StepExecutor } from './step-executor.service';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectRepository(WorkflowEntity) private workflowRepo: Repository<WorkflowEntity>,
    @InjectRepository(WorkflowStepEntity) private stepRepo: Repository<WorkflowStepEntity>,
    @InjectRepository(WorkflowTemplateEntity) private templateRepo: Repository<WorkflowTemplateEntity>,
    private stepExecutor: StepExecutor,
  ) {}

  async createFromTemplate(tenantId: string, templateId: string, triggeredBy: string, contextData?: Record<string, unknown>) {
    const template = await this.templateRepo.findOne({ where: { id: templateId } });
    if (!template) throw new NotFoundException('Workflow template not found');

    const workflow = this.workflowRepo.create({
      tenantId,
      name: template.name,
      type: template.type,
      status: 'active',
      triggeredBy,
      contextData: contextData || {},
    });
    const saved = await this.workflowRepo.save(workflow);

    const steps = template.stepTemplates.map(st => this.stepRepo.create({
      workflowId: saved.id,
      index: st.index,
      name: st.name,
      type: st.type,
      config: st.config,
      dueAt: st.dueDays ? new Date(Date.now() + st.dueDays * 86400000) : undefined,
    }));
    await this.stepRepo.save(steps);

    // Execute first step
    await this.advanceWorkflow(saved.id);

    return this.workflowRepo.findOne({ where: { id: saved.id }, relations: ['steps'] });
  }

  async create(tenantId: string, data: {
    name: string;
    type: string;
    triggeredBy: string;
    contextData?: Record<string, unknown>;
    steps: Array<{ name: string; type: string; config?: Record<string, unknown>; assigneeId?: string; dueAt?: string }>;
  }) {
    const workflow = this.workflowRepo.create({
      tenantId,
      name: data.name,
      type: data.type,
      status: 'active',
      triggeredBy: data.triggeredBy,
      contextData: data.contextData || {},
    });
    const saved = await this.workflowRepo.save(workflow);

    const steps = data.steps.map((s, i) => this.stepRepo.create({
      workflowId: saved.id,
      index: i,
      name: s.name,
      type: s.type,
      config: s.config || {},
      assigneeId: s.assigneeId,
      dueAt: s.dueAt ? new Date(s.dueAt) : undefined,
    }));
    await this.stepRepo.save(steps);

    await this.advanceWorkflow(saved.id);
    return this.workflowRepo.findOne({ where: { id: saved.id }, relations: ['steps'] });
  }

  async findByTenant(tenantId: string, status?: string) {
    const where: any = { tenantId };
    if (status) where.status = status;
    return this.workflowRepo.find({ where, relations: ['steps'], order: { createdAt: 'DESC' } });
  }

  async findById(id: string) {
    const wf = await this.workflowRepo.findOne({ where: { id }, relations: ['steps'] });
    if (!wf) throw new NotFoundException('Workflow not found');
    return wf;
  }

  async approveStep(workflowId: string, stepId: string, userId: string, result?: Record<string, unknown>) {
    const step = await this.stepRepo.findOne({ where: { id: stepId, workflowId } });
    if (!step) throw new NotFoundException('Step not found');
    if (step.status !== 'in_progress') throw new BadRequestException('Step is not awaiting action');

    step.status = 'completed';
    step.result = { ...result, approvedBy: userId, approvedAt: new Date().toISOString() };
    step.completedAt = new Date();
    await this.stepRepo.save(step);

    await this.advanceWorkflow(workflowId);
    return this.findById(workflowId);
  }

  async rejectStep(workflowId: string, stepId: string, userId: string, reason?: string) {
    const step = await this.stepRepo.findOne({ where: { id: stepId, workflowId } });
    if (!step) throw new NotFoundException('Step not found');

    step.status = 'failed';
    step.result = { rejectedBy: userId, reason, rejectedAt: new Date().toISOString() };
    step.completedAt = new Date();
    await this.stepRepo.save(step);

    const workflow = await this.findById(workflowId);
    workflow.status = 'failed';
    await this.workflowRepo.save(workflow);

    return this.findById(workflowId);
  }

  async completeStep(workflowId: string, stepId: string, result?: Record<string, unknown>) {
    const step = await this.stepRepo.findOne({ where: { id: stepId, workflowId } });
    if (!step) throw new NotFoundException('Step not found');

    step.status = 'completed';
    step.result = result || {};
    step.completedAt = new Date();
    await this.stepRepo.save(step);

    await this.advanceWorkflow(workflowId);
    return this.findById(workflowId);
  }

  async cancelWorkflow(id: string) {
    const workflow = await this.findById(id);
    workflow.status = 'cancelled';
    await this.workflowRepo.save(workflow);

    // Cancel pending steps
    await this.stepRepo.update(
      { workflowId: id, status: 'pending' },
      { status: 'skipped' },
    );
    await this.stepRepo.update(
      { workflowId: id, status: 'in_progress' },
      { status: 'skipped' },
    );

    return this.findById(id);
  }

  private async advanceWorkflow(workflowId: string) {
    const workflow = await this.findById(workflowId);
    if (workflow.status !== 'active') return;

    const sortedSteps = workflow.steps.sort((a, b) => a.index - b.index);
    const nextStep = sortedSteps.find(s => s.status === 'pending');

    if (!nextStep) {
      // All steps done
      workflow.status = 'completed';
      workflow.completedAt = new Date();
      workflow.currentStepIndex = sortedSteps.length;
      await this.workflowRepo.save(workflow);
      return;
    }

    nextStep.status = 'in_progress';
    nextStep.startedAt = new Date();
    await this.stepRepo.save(nextStep);

    workflow.currentStepIndex = nextStep.index;
    await this.workflowRepo.save(workflow);

    // Auto-execute non-manual steps
    if (['notification', 'automated', 'condition'].includes(nextStep.type)) {
      const execResult = await this.stepExecutor.execute(nextStep, workflow.contextData);
      if (execResult.success) {
        nextStep.status = 'completed';
        nextStep.result = execResult.result || {};
        nextStep.completedAt = new Date();
        await this.stepRepo.save(nextStep);

        // Handle condition branching
        if (nextStep.type === 'condition' && execResult.result) {
          const conditionMet = execResult.result.conditionMet;
          if (!conditionMet && nextStep.config?.skipToOnFalse !== undefined) {
            const skipTo = nextStep.config.skipToOnFalse as number;
            const stepsToSkip = sortedSteps.filter(s => s.index > nextStep.index && s.index < skipTo);
            for (const s of stepsToSkip) {
              s.status = 'skipped';
              await this.stepRepo.save(s);
            }
          }
        }

        // Continue to next step
        await this.advanceWorkflow(workflowId);
      } else {
        nextStep.status = 'failed';
        nextStep.result = { error: execResult.error };
        await this.stepRepo.save(nextStep);
        workflow.status = 'failed';
        await this.workflowRepo.save(workflow);
      }
    }
    // Manual steps (approval, task) wait for user action
  }
}
