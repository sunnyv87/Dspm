import { DataSource } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Tenant } from '../../entities/tenant.entity';
import { User } from '../../entities/user.entity';
import { Session } from '../../entities/session.entity';
import { ApiToken } from '../../entities/api-token.entity';

const ALL_PERMISSIONS = [
  'consent:read', 'consent:write', 'consent:delete',
  'breach:read', 'breach:write', 'breach:manage',
  'dsar:read', 'dsar:write', 'dsar:manage',
  'data-map:read', 'data-map:write',
  'risk:read', 'risk:write',
  'reports:read', 'reports:export',
  'settings:read', 'settings:write',
  'admin:users', 'admin:roles', 'admin:tokens',
  'admin:tenant',
];

const systemRoles: Array<{
  name: string;
  description: string;
  permissions: string[];
}> = [
  {
    name: 'super_admin',
    description: 'System-wide super administrator with unrestricted access',
    permissions: ALL_PERMISSIONS,
  },
  {
    name: 'tenant_admin',
    description: 'Tenant administrator with full tenant-level access',
    permissions: [
      'consent:read', 'consent:write', 'consent:delete',
      'breach:read', 'breach:write', 'breach:manage',
      'dsar:read', 'dsar:write', 'dsar:manage',
      'data-map:read', 'data-map:write',
      'risk:read', 'risk:write',
      'reports:read', 'reports:export',
      'settings:read', 'settings:write',
      'admin:users', 'admin:roles', 'admin:tokens',
    ],
  },
  {
    name: 'privacy_officer',
    description: 'Privacy Officer with broad privacy management access',
    permissions: [
      'consent:read', 'consent:write',
      'breach:read', 'breach:write', 'breach:manage',
      'dsar:read', 'dsar:write', 'dsar:manage',
      'data-map:read', 'data-map:write',
      'risk:read', 'risk:write',
      'reports:read', 'reports:export',
      'settings:read',
    ],
  },
  {
    name: 'analyst',
    description: 'Data Analyst with read and reporting access',
    permissions: [
      'consent:read',
      'breach:read',
      'dsar:read',
      'data-map:read',
      'risk:read',
      'reports:read', 'reports:export',
    ],
  },
  {
    name: 'viewer',
    description: 'Read-only access to all modules',
    permissions: [
      'consent:read',
      'breach:read',
      'dsar:read',
      'data-map:read',
      'risk:read',
      'reports:read',
    ],
  },
];

async function seed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'privacyops',
    password: process.env.DB_PASSWORD || 'privacyops',
    database: process.env.DB_DATABASE || 'privacyops_auth',
    entities: [Tenant, User, Role, ApiToken, Session],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const roleRepository = dataSource.getRepository(Role);

    for (const roleData of systemRoles) {
      const existing = await roleRepository.findOne({
        where: { name: roleData.name, isSystem: true },
      });

      if (existing) {
        // Update permissions if they've changed
        existing.permissions = roleData.permissions;
        existing.description = roleData.description;
        await roleRepository.save(existing);
        console.log(`Updated system role: ${roleData.name}`);
      } else {
        const role = roleRepository.create({
          ...roleData,
          tenantId: null,
          isSystem: true,
        });
        await roleRepository.save(role);
        console.log(`Created system role: ${roleData.name}`);
      }
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

seed();
