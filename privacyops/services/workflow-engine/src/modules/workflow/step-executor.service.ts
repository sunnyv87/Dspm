import { Injectable, Logger } from '@nestjs/common';
import { WorkflowStepEntity } from '../../entities/workflow-step.entity';

@Injectable()
export class StepExecutor {
  private readonly logger = new Logger(StepExecutor.name);

  async execute(step: WorkflowStepEntity, contextData: Record<string, unknown>): Promise<{
    success: boolean;
    result?: Record<string, unknown>;
    error?: string;
  }> {
    this.logger.log(`Executing step "${step.name}" (type: ${step.type})`);

    switch (step.type) {
      case 'approval':
        // Approval steps wait for user action - don't auto-execute
        return { success: true, result: { awaitingApproval: true } };

      case 'task':
        // Task steps wait for manual completion
        return { success: true, result: { awaitingCompletion: true } };

      case 'notification':
        // Trigger notification via Kafka or direct HTTP
        return this.executeNotificationStep(step, contextData);

      case 'automated':
        // Run automated action based on config
        return this.executeAutomatedStep(step, contextData);

      case 'condition':
        // Evaluate condition
        return this.evaluateCondition(step, contextData);

      default:
        return { success: false, error: `Unknown step type: ${step.type}` };
    }
  }

  private async executeNotificationStep(step: WorkflowStepEntity, context: Record<string, unknown>) {
    // In production, this would publish to Kafka topic 'notification.send'
    this.logger.log(`Notification step: would notify ${step.config?.recipientId || 'assignee'}`);
    return { success: true, result: { notified: true } };
  }

  private async executeAutomatedStep(step: WorkflowStepEntity, context: Record<string, unknown>) {
    const action = step.config?.action as string;
    this.logger.log(`Automated step: executing action "${action}"`);
    // Extensible: plug in different automated actions here
    return { success: true, result: { action, executed: true } };
  }

  private async evaluateCondition(step: WorkflowStepEntity, context: Record<string, unknown>) {
    const field = step.config?.field as string;
    const operator = step.config?.operator as string;
    const value = step.config?.value;
    const actual = context[field];

    let conditionMet = false;
    switch (operator) {
      case 'eq': conditionMet = actual === value; break;
      case 'neq': conditionMet = actual !== value; break;
      case 'gt': conditionMet = (actual as number) > (value as number); break;
      case 'lt': conditionMet = (actual as number) < (value as number); break;
      case 'contains': conditionMet = String(actual).includes(String(value)); break;
      default: conditionMet = false;
    }

    return { success: true, result: { conditionMet, field, operator, value, actual } };
  }
}
