import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('dspm_sync_log')
@Index(['tenantId', 'resourceType'])
export class DspmSyncEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') tenantId: string;
  @Column() resourceType: string;
  @Column({ nullable: true }) resourceId: string;
  @Column() syncDirection: string;
  @Column({ type: 'enum', enum: ['pending', 'syncing', 'completed', 'failed'], default: 'pending' }) status: string;
  @Column({ nullable: true }) errorMessage: string;
  @Column({ type: 'jsonb', nullable: true }) syncData: Record<string, unknown>;
  @CreateDateColumn() syncedAt: Date;
}
