import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowTemplateEntity } from '../../entities/workflow-template.entity';

@Injectable()
export class TemplateService {
  constructor(@InjectRepository(WorkflowTemplateEntity) private repo: Repository<WorkflowTemplateEntity>) {}

  async findAll(tenantId?: string) {
    if (tenantId) {
      return this.repo.find({ where: [{ tenantId }, { tenantId: null as any }], order: { name: 'ASC' } });
    }
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string) {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Template not found');
    return t;
  }

  async create(data: Partial<WorkflowTemplateEntity>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<WorkflowTemplateEntity>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.repo.delete(id);
  }

  async seedDefaults() {
    const defaults = [
      {
        name: 'DPIA Assessment',
        description: 'Data Protection Impact Assessment workflow',
        type: 'dpia',
        stepTemplates: [
          { index: 0, name: 'Submit DPIA', type: 'task', config: {}, dueDays: 1 },
          { index: 1, name: 'DPO Review', type: 'approval', config: { role: 'dpo' }, dueDays: 5 },
          { index: 2, name: 'Risk Assessment', type: 'task', config: {}, dueDays: 10 },
          { index: 3, name: 'Final Approval', type: 'approval', config: { role: 'org_admin' }, dueDays: 3 },
          { index: 4, name: 'Notify Stakeholders', type: 'notification', config: {} },
        ],
      },
      {
        name: 'Data Subject Rights Request',
        description: 'Handle DSAR (access, erasure, portability)',
        type: 'rights_request',
        stepTemplates: [
          { index: 0, name: 'Verify Identity', type: 'task', config: {}, dueDays: 2 },
          { index: 1, name: 'Locate Data', type: 'automated', config: { action: 'data_discovery' }, dueDays: 5 },
          { index: 2, name: 'Review Findings', type: 'approval', config: { role: 'privacy_officer' }, dueDays: 3 },
          { index: 3, name: 'Execute Action', type: 'automated', config: { action: 'execute_rights' } },
          { index: 4, name: 'Notify Data Subject', type: 'notification', config: {} },
        ],
      },
      {
        name: 'Breach Response',
        description: 'Incident response workflow for data breaches',
        type: 'breach_response',
        stepTemplates: [
          { index: 0, name: 'Initial Assessment', type: 'task', config: {}, dueDays: 1 },
          { index: 1, name: 'Check Notification Required', type: 'condition', config: { field: 'severity', operator: 'eq', value: 'critical', skipToOnFalse: 4 } },
          { index: 2, name: 'DPA Notification', type: 'task', config: {}, dueDays: 3 },
          { index: 3, name: 'Subject Notification', type: 'notification', config: {} },
          { index: 4, name: 'Containment', type: 'task', config: {} },
          { index: 5, name: 'Root Cause Analysis', type: 'task', config: {}, dueDays: 14 },
          { index: 6, name: 'Closure Approval', type: 'approval', config: { role: 'org_admin' }, dueDays: 5 },
        ],
      },
    ];

    for (const d of defaults) {
      const exists = await this.repo.findOne({ where: { name: d.name, tenantId: null as any } });
      if (!exists) await this.repo.save(this.repo.create(d));
    }
  }
}
