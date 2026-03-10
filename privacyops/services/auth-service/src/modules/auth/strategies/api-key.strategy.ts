import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import * as crypto from 'crypto';
import { ApiToken } from '../../../entities/api-token.entity';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(
    @InjectRepository(ApiToken)
    private readonly apiTokenRepository: Repository<ApiToken>,
  ) {
    super();
  }

  async validate(request: Request): Promise<Record<string, unknown>> {
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    const token = await this.apiTokenRepository.findOne({
      where: { tokenHash },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (token.revokedAt) {
      throw new UnauthorizedException('API key has been revoked');
    }

    if (token.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // Update last used timestamp
    await this.apiTokenRepository.update(token.id, {
      lastUsedAt: new Date(),
    });

    return {
      userId: token.createdBy,
      tenantId: token.tenantId,
      role: 'api_token',
      permissions: token.scopes,
      sessionJti: `api-token:${token.id}`,
      email: '',
    };
  }
}
