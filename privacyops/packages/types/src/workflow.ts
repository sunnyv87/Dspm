import type { UUID, ISODateString, AuditableEntity } from './common';

export enum WorkflowStatus { PENDING = 'pending', ACTIVE = 'active', COMPLETED = 'completed', CANCELLED = 'cancelled', FAILED = 'failed' }
export enum WorkflowStepType { APPROVAL = 'approval', TASK = 'task', NOTIFICATION = 'notification', AUTOMATED = 'automated', CONDITION = 'condition' }
export enum WorkflowStepStatus { PENDING = 'pending', IN_PROGRESS = 'in_progress', COMPLETED = 'completed', SKIPPED = 'skipped', FAILED = 'failed' }

export interface Workflow extends AuditableEntity {
  name: string;
  type: string;
  status: WorkflowStatus;
  currentStepIndex: number;
  steps: WorkflowStep[];
  contextData: Record<string, unknown>;
  triggeredBy: UUID;
  completedAt?: ISODateString;
}

export interface WorkflowStep {
  index: number;
  name: string;
  type: WorkflowStepType;
  status: WorkflowStepStatus;
  assigneeId?: UUID;
  config: Record<string, unknown>;
  result?: Record<string, unknown>;
  startedAt?: ISODateString;
  completedAt?: ISODateString;
  dueAt?: ISODateString;
}

export interface WorkflowTemplate extends AuditableEntity {
  name: string;
  description: string;
  type: string;
  stepTemplates: WorkflowStepTemplate[];
  isActive: boolean;
}

export interface WorkflowStepTemplate {
  index: number;
  name: string;
  type: WorkflowStepType;
  config: Record<string, unknown>;
  dueDays?: number;
}
