import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsEmail,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalDecision } from '../../../entities/approval-record.entity';

export class SubmitApprovalDto {
  @ApiProperty({ description: 'Task ID for the approval' })
  @IsUUID()
  taskId: string;

  @ApiProperty({ description: 'Workflow instance ID' })
  @IsUUID()
  instanceId: string;

  @ApiProperty({ description: 'Approval decision', enum: ApprovalDecision })
  @IsEnum(ApprovalDecision)
  decision: ApprovalDecision;

  @ApiPropertyOptional({ description: 'Approver email address' })
  @IsOptional()
  @IsEmail()
  approverEmail?: string;

  @ApiPropertyOptional({ description: 'Comments for the approval decision' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ description: 'Conditions attached to the approval' })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;
}
