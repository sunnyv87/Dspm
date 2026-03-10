import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { WorkflowTemplateEntity } from '../../entities/workflow-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowTemplateEntity])],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
