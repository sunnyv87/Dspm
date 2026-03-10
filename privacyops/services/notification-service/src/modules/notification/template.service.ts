import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Handlebars from 'handlebars';
import { NotificationTemplateEntity } from '../../entities/notification-template.entity';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(NotificationTemplateEntity) private repo: Repository<NotificationTemplateEntity>,
  ) {}

  async render(templateKey: string, data: Record<string, unknown>): Promise<{ subject: string; body: string } | null> {
    const template = await this.repo.findOne({ where: { templateKey, isActive: true } });
    if (!template) return null;

    const subjectCompiled = Handlebars.compile(template.subject);
    const bodyCompiled = Handlebars.compile(template.bodyTemplate);

    return {
      subject: subjectCompiled(data),
      body: bodyCompiled(data),
    };
  }

  async findAll() { return this.repo.find(); }

  async create(data: Partial<NotificationTemplateEntity>) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<NotificationTemplateEntity>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }
}
