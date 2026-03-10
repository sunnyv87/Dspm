import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { CreateAuditEntryDto } from '../audit/dto/create-audit-entry.dto';
import { InternalApiGuard } from '../../common/guards/internal-api.guard';
import { AuditEntry } from '../../entities/audit-entry.entity';

@ApiTags('ingestion')
@ApiSecurity('internal-api-key')
@Controller('audit/ingest')
@UseGuards(InternalApiGuard)
export class IngestionController {
  private readonly logger = new Logger(IngestionController.name);

  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingest a single audit entry (service-to-service)' })
  @ApiResponse({ status: 201, description: 'Audit entry created' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiBody({ type: CreateAuditEntryDto })
  async ingest(@Body() dto: CreateAuditEntryDto): Promise<AuditEntry> {
    return this.ingestionService.ingest(dto);
  }

  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingest a batch of audit entries (service-to-service)' })
  @ApiResponse({ status: 201, description: 'Batch ingestion result' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiBody({ type: [CreateAuditEntryDto] })
  async ingestBatch(
    @Body() entries: CreateAuditEntryDto[],
  ): Promise<{ ingested: number; errors: number }> {
    return this.ingestionService.ingestBatch(entries);
  }
}
