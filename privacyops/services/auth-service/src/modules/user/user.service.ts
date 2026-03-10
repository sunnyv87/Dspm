import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) {}

  async findByTenant(tenantId: string) {
    return this.userRepo.find({ where: { tenantId, status: UserStatus.ACTIVE }, relations: ['role'] });
  }

  async findById(id: string, tenantId: string) {
    const user = await this.userRepo.findOne({ where: { id, tenantId }, relations: ['role'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(tenantId: string, data: any) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = this.userRepo.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      roleId: data.roleId,
      tenantId,
    });
    return this.userRepo.save(user);
  }

  async update(id: string, tenantId: string, data: any) {
    const user = await this.findById(id, tenantId);
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 12);
      delete data.password;
    }
    Object.assign(user, data);
    return this.userRepo.save(user);
  }

  async assignRole(userId: string, tenantId: string, roleId: string) {
    const user = await this.findById(userId, tenantId);
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');
    user.roleId = roleId;
    return this.userRepo.save(user);
  }

  async deactivate(id: string, tenantId: string) {
    await this.userRepo.update({ id, tenantId }, { status: UserStatus.INACTIVE });
  }
}
