import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import { ApiToken } from '../../entities/api-token.entity';

@Injectable()
export class ApiTokenService {
  constructor(@InjectRepository(ApiToken) private repo: Repository<ApiToken>) {}

  async findByTenant(tenantId: string) {
    return this.repo.find({ where: { tenantId, revokedAt: IsNull() } });
  }

  async findById(id: string, tenantId: string) {
    const token = await this.repo.findOne({ where: { id, tenantId } });
    if (!token) throw new NotFoundException('API token not found');
    return token;
  }

  async create(tenantId: string, createdBy: string, data: { name: string; scopes: string[]; expiresAt: Date }) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const apiToken = this.repo.create({
      tenantId,
      createdBy,
      name: data.name,
      tokenHash,
      scopes: data.scopes,
      expiresAt: data.expiresAt,
    });
    await this.repo.save(apiToken);

    return { id: apiToken.id, token: rawToken, name: apiToken.name, expiresAt: apiToken.expiresAt };
  }

  async revoke(id: string, tenantId: string) {
    const token = await this.findById(id, tenantId);
    token.revokedAt = new Date();
    return this.repo.save(token);
  }
}
