import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class InternalApiGuard implements CanActivate {
  private readonly logger = new Logger(InternalApiGuard.name);
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('internalApiKey');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-api-key'] as string;

    if (!providedKey) {
      throw new UnauthorizedException('Missing x-api-key header');
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(providedKey),
      Buffer.from(this.apiKey),
    );

    if (!isValid) {
      this.logger.warn(
        `Invalid internal API key from IP ${request.ip}`,
      );
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
