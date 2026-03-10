import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

export interface PolicyRule {
  pattern: string;
  type: 'regex' | 'keyword' | 'ai';
  label: string;
  regulationTag: string;
  confidence: number;
}

@Entity('classification_policies')
@Unique(['tenantId', 'name'])
export class ClassificationPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  rulesJson: PolicyRule[];

  @Column({ type: 'varchar', length: 100, default: 'unclassified' })
  defaultLabel: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
