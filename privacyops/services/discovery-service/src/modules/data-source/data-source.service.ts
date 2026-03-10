import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource, DataSourceStatus, HealthStatus } from '../../entities/data-source.entity';
import { DspmClientService } from '../dspm-client/dspm-client.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { QueryDataSourceDto } from './dto/query-data-source.dto';

@Injectable()
export class DataSourceService {
  private readonly logger = new Logger(DataSourceService.name);

  constructor(
    @InjectRepository(DataSource)
    private readonly dataSourceRepository: Repository<DataSource>,
    private readonly dspmClient: DspmClientService,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    dto: CreateDataSourceDto,
  ): Promise<DataSource> {
    const dataSource = this.dataSourceRepository.create({
      tenantId,
      createdBy: userId,
      name: dto.name,
      type: dto.type,
      status: DataSourceStatus.PENDING,
      connectionConfig: dto.connectionConfig,
      credentialType: dto.credentialType,
      ownerUserId: dto.ownerUserId,
      businessUnit: dto.businessUnit,
      description: dto.description,
      tags: dto.tags || [],
    });

    const saved = await this.dataSourceRepository.save(dataSource);
    this.logger.log(`Data source created: ${saved.id} for tenant ${tenantId}`);
    return saved;
  }

  async findAll(
    tenantId: string,
    query: QueryDataSourceDto,
  ): Promise<{ data: DataSource[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.dataSourceRepository
      .createQueryBuilder('ds')
      .where('ds.tenantId = :tenantId', { tenantId });

    if (query.type) {
      qb.andWhere('ds.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('ds.status = :status', { status: query.status });
    }

    if (query.businessUnit) {
      qb.andWhere('ds.businessUnit = :businessUnit', { businessUnit: query.businessUnit });
    }

    qb.orderBy('ds.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string): Promise<DataSource> {
    const dataSource = await this.dataSourceRepository.findOne({
      where: { id, tenantId },
    });

    if (!dataSource) {
      throw new NotFoundException(`Data source ${id} not found`);
    }

    return dataSource;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateDataSourceDto,
  ): Promise<DataSource> {
    const dataSource = await this.findById(tenantId, id);

    if (dto.name !== undefined) dataSource.name = dto.name;
    if (dto.type !== undefined) dataSource.type = dto.type;
    if (dto.status !== undefined) dataSource.status = dto.status;
    if (dto.connectionConfig !== undefined) dataSource.connectionConfig = dto.connectionConfig;
    if (dto.credentialType !== undefined) dataSource.credentialType = dto.credentialType;
    if (dto.ownerUserId !== undefined) dataSource.ownerUserId = dto.ownerUserId;
    if (dto.businessUnit !== undefined) dataSource.businessUnit = dto.businessUnit;
    if (dto.description !== undefined) dataSource.description = dto.description;
    if (dto.tags !== undefined) dataSource.tags = dto.tags;

    const saved = await this.dataSourceRepository.save(dataSource);
    this.logger.log(`Data source updated: ${id} for tenant ${tenantId}`);
    return saved;
  }

  async deactivate(tenantId: string, id: string): Promise<DataSource> {
    const dataSource = await this.findById(tenantId, id);
    dataSource.status = DataSourceStatus.INACTIVE;
    const saved = await this.dataSourceRepository.save(dataSource);
    this.logger.log(`Data source deactivated: ${id} for tenant ${tenantId}`);
    return saved;
  }

  async triggerHealthCheck(tenantId: string, id: string): Promise<DataSource> {
    const dataSource = await this.findById(tenantId, id);

    try {
      const healthResponse = await this.dspmClient.fetchConnectorHealth(id);

      let healthStatus: HealthStatus;
      switch (healthResponse.status) {
        case 'healthy':
          healthStatus = HealthStatus.HEALTHY;
          break;
        case 'degraded':
          healthStatus = HealthStatus.DEGRADED;
          break;
        case 'unhealthy':
          healthStatus = HealthStatus.UNHEALTHY;
          break;
        default:
          healthStatus = HealthStatus.UNKNOWN;
      }

      dataSource.healthStatus = healthStatus;
      dataSource.lastHealthCheckAt = new Date();

      if (healthStatus === HealthStatus.UNHEALTHY) {
        dataSource.status = DataSourceStatus.ERROR;
      } else if (healthStatus === HealthStatus.HEALTHY && dataSource.status === DataSourceStatus.ERROR) {
        dataSource.status = DataSourceStatus.ACTIVE;
      }
    } catch (error) {
      this.logger.error(`Health check failed for data source ${id}: ${(error as Error).message}`);
      dataSource.healthStatus = HealthStatus.UNHEALTHY;
      dataSource.lastHealthCheckAt = new Date();
      dataSource.status = DataSourceStatus.ERROR;
    }

    const saved = await this.dataSourceRepository.save(dataSource);
    this.logger.log(`Health check completed for data source ${id}: ${saved.healthStatus}`);
    return saved;
  }

  async findAllActive(tenantId: string): Promise<DataSource[]> {
    return this.dataSourceRepository.find({
      where: { tenantId, status: DataSourceStatus.ACTIVE },
    });
  }

  async updateAssetCounts(
    id: string,
    assetCount: number,
    sensitiveAssetCount: number,
  ): Promise<void> {
    await this.dataSourceRepository.update(id, { assetCount, sensitiveAssetCount });
  }

  async updateLastSyncAt(id: string): Promise<void> {
    await this.dataSourceRepository.update(id, { lastSyncAt: new Date() });
  }
}
