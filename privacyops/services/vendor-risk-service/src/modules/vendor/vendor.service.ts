import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from '../../entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';
import { KafkaService } from '../../common/kafka/kafka.service';

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);

  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(tenantId: string, dto: CreateVendorDto): Promise<Vendor> {
    const existing = await this.vendorRepository.findOne({
      where: { tenantId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Vendor with name "${dto.name}" already exists for this tenant`);
    }

    const vendor = this.vendorRepository.create({
      tenantId,
      name: dto.name,
      description: dto.description || null,
      website: dto.website || null,
      contactEmail: dto.contactEmail || null,
      contactName: dto.contactName || null,
      category: dto.category,
      riskLevel: dto.riskLevel,
      status: dto.status,
      dataProcessingAgreement: dto.dataProcessingAgreement || false,
      nextAssessmentDate: dto.nextAssessmentDate ? new Date(dto.nextAssessmentDate) : null,
      metadata: dto.metadata || {},
    });

    const saved = await this.vendorRepository.save(vendor);
    this.logger.log(`Created vendor "${saved.name}" (${saved.id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.vendor.created', {
      key: saved.id,
      value: { eventType: 'VENDOR_CREATED', tenantId, vendorId: saved.id, name: saved.name, category: saved.category, timestamp: new Date().toISOString() },
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryVendorDto,
  ): Promise<{ data: Vendor[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.vendorRepository
      .createQueryBuilder('vendor')
      .where('vendor.tenantId = :tenantId', { tenantId });

    if (query.search) {
      qb.andWhere('(vendor.name ILIKE :search OR vendor.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.category) {
      qb.andWhere('vendor.category = :category', { category: query.category });
    }

    if (query.riskLevel) {
      qb.andWhere('vendor.riskLevel = :riskLevel', { riskLevel: query.riskLevel });
    }

    if (query.status) {
      qb.andWhere('vendor.status = :status', { status: query.status });
    }

    if (query.dataProcessingAgreement !== undefined) {
      qb.andWhere('vendor.dataProcessingAgreement = :dpa', { dpa: query.dataProcessingAgreement });
    }

    qb.orderBy('vendor.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id, tenantId },
      relations: ['assessments', 'questionnaires', 'findings'],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID "${id}" not found`);
    }

    return vendor;
  }

  async update(tenantId: string, id: string, dto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findById(tenantId, id);

    if (dto.name && dto.name !== vendor.name) {
      const existing = await this.vendorRepository.findOne({
        where: { tenantId, name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Vendor with name "${dto.name}" already exists for this tenant`);
      }
    }

    Object.assign(vendor, dto);
    if (dto.nextAssessmentDate) {
      vendor.nextAssessmentDate = new Date(dto.nextAssessmentDate);
    }

    const saved = await this.vendorRepository.save(vendor);
    this.logger.log(`Updated vendor "${saved.name}" (${saved.id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.vendor.updated', {
      key: saved.id,
      value: { eventType: 'VENDOR_UPDATED', tenantId, vendorId: saved.id, name: saved.name, changes: Object.keys(dto), timestamp: new Date().toISOString() },
    });

    return saved;
  }

  async delete(tenantId: string, id: string): Promise<Vendor> {
    const vendor = await this.findById(tenantId, id);
    vendor.status = 'OFFBOARDED' as any;
    const saved = await this.vendorRepository.save(vendor);
    this.logger.log(`Offboarded vendor "${saved.name}" (${saved.id}) for tenant ${tenantId}`);

    await this.kafkaService.emit('vendor-risk.vendor.offboarded', {
      key: saved.id,
      value: { eventType: 'VENDOR_OFFBOARDED', tenantId, vendorId: saved.id, name: saved.name, timestamp: new Date().toISOString() },
    });

    return saved;
  }
}
