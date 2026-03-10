import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly kafkaService: KafkaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.emitAuditEvent({
            action: `${method} ${url}`,
            userId: user?.userId,
            tenantId: user?.tenantId,
            resource: 'dashboard-bff',
            duration,
            status: 'success',
            timestamp: new Date().toISOString(),
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.emitAuditEvent({
            action: `${method} ${url}`,
            userId: user?.userId,
            tenantId: user?.tenantId,
            resource: 'dashboard-bff',
            duration,
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        },
      }),
    );
  }

  private emitAuditEvent(event: Record<string, any>): void {
    try {
      this.kafkaService.emit('audit.dashboard.access', event);
    } catch (error) {
      this.logger.warn(`Failed to emit audit event: ${error.message}`);
    }
  }
}
