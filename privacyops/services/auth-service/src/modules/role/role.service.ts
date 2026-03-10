import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';

@Injectable()
export class RoleService {
  constructor(@InjectRepository(Role) private repo: Repository<Role>) {}

  async findByTenant(tenantId: string) {
    return this.repo.find({ where: [{ tenantId }, { isSystem: true }] });
  }

  async findById(id: string) {
    const role = await this.repo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(tenantId: string, data: Partial<Role>) {
    const existing = await this.repo.findOne({ where: { name: data.name, tenantId } });
    if (existing) throw new ConflictException('Role name already exists');
    const role = this.repo.create({ ...data, tenantId });
    return this.repo.save(role);
  }

  async update(id: string, data: Partial<Role>) {
    const role = await this.findById(id);
    if (role.isSystem) throw new ConflictException('Cannot modify system roles');
    Object.assign(role, data);
    return this.repo.save(role);
  }

  async delete(id: string) {
    const role = await this.findById(id);
    if (role.isSystem) throw new ConflictException('Cannot delete system roles');
    await this.repo.remove(role);
  }
}
