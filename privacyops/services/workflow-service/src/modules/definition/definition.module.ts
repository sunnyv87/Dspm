import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowDefinition } from '../../entities/workflow-definition.entity';
import { DefinitionController } from './definition.controller';
import { DefinitionService } from './definition.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowDefinition])],
  controllers: [DefinitionController],
  providers: [DefinitionService],
  exports: [DefinitionService],
})
export class DefinitionModule {}
