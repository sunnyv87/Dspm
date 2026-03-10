import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { CreateAuditEntryDto } from '../audit/dto/create-audit-entry.dto';
import { AuditEntry } from '../../entities/audit-entry.entity';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly auditService: AuditService) {}

  async ingest(dto: CreateAuditEntryDto): Promise<AuditEntry> {
    this.logger.debug(
      `Ingesting audit entry: action=${dto.action} entityType=${dto.entityType} tenantId=${dto.tenantId}`,
    );
    return this.auditService.createEntry(dto);
  }

  async ingestBatch(entries: CreateAuditEntryDto[]): Promise<{ ingested: number; errors: number }> {
    let ingested = 0;
    let errors = 0;

    for (const dto of entries) {
      try {
        await this.auditService.createEntry(dto);
        ingested++;
      } catch (error) {
        errors++;
        this.logger.error(
          `Failed to ingest batch entry: ${error.message}`,
          error.stack,
        );
      }
    }

    this.logger.log(`Batch ingestion complete: ${ingested} ingested, ${errors} errors`);
    return { ingested, errors };
  }
}
