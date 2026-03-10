import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(@InjectRepository(Tenant) private repo: Repository<Tenant>) {}

  async findAll() { return this.repo.find({ where: { isActive: true } }); }
  
  async findById(id: string) {
    const tenant = await this.repo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findBySlug(slug: string) {
    return this.repo.findOne({ where: { slug } });
  }

  async create(data: Partial<Tenant>) {
    const existing = await this.repo.findOne({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('Tenant slug already exists');
    const tenant = this.repo.create(data);
    return this.repo.save(tenant);
  }

  async update(id: string, data: Partial<Tenant>) {
    await this.findById(id);
    await this.repo.update(id, data);
    return this.findById(id);
  }
}
