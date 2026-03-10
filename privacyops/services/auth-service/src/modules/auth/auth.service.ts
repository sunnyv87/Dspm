import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from '../../entities/user.entity';
import { Session } from '../../entities/session.entity';
import { Tenant } from '../../entities/tenant.entity';
import { Role } from '../../entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, status: UserStatus.ACTIVE },
      relations: ['role', 'tenant'],
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account is suspended');
    }

    const tokenJti = uuidv4();
    const refreshTokenTtl = this.configService.get<number>('jwt.refreshTokenTtl') || 604800;

    const session = this.sessionRepo.create({
      userId: user.id,
      tenantId: user.tenantId,
      ipAddress,
      userAgent,
      tokenJti,
      expiresAt: new Date(Date.now() + refreshTokenTtl * 1000),
    });
    await this.sessionRepo.save(session);

    const tokens = await this.generateTokenPair(user, session);

    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name || null,
        tenantId: user.tenantId,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    let tenant = await this.tenantRepo.findOne({ where: { slug: dto.tenantSlug } });
    if (!tenant) {
      tenant = this.tenantRepo.create({
        name: dto.organizationName || dto.tenantSlug,
        slug: dto.tenantSlug,
      });
      await this.tenantRepo.save(tenant);
    }

    // Find or create a default role for the tenant
    let defaultRole = await this.roleRepo.findOne({ where: { name: 'member', tenantId: tenant.id } });
    if (!defaultRole) {
      defaultRole = await this.roleRepo.findOne({ where: { name: 'member', isSystem: true } });
    }

    const saltRounds = this.configService.get<number>('dspm.bcryptSaltRounds') || 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      tenantId: tenant.id,
      roleId: defaultRole?.id,
    });
    await this.userRepo.save(user);

    return { id: user.id, email: user.email, tenantId: tenant.id };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.secret'),
      });

      const session = await this.sessionRepo.findOne({
        where: { id: payload.sessionId },
      });
      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session expired');
      }

      const user = await this.userRepo.findOne({
        where: { id: payload.sub, status: UserStatus.ACTIVE },
        relations: ['role'],
      });
      if (!user) throw new UnauthorizedException('User not found');

      return this.generateTokenPair(user, session);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(sessionId: string) {
    await this.sessionRepo.delete(sessionId);
  }

  private async generateTokenPair(user: User, session: Session) {
    const permissions = user.role?.permissions || [];
    const accessTokenTtl = this.configService.get<number>('jwt.accessTokenTtl') || 900;
    const refreshTokenTtl = this.configService.get<number>('jwt.refreshTokenTtl') || 604800;

    const accessToken = this.jwtService.sign({
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role?.name || null,
      permissions,
      sessionId: session.id,
      type: 'access',
    });

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        tenantId: user.tenantId,
        sessionId: session.id,
        tokenJti: session.tokenJti,
        type: 'refresh',
      },
      { expiresIn: refreshTokenTtl },
    );

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(Date.now() + accessTokenTtl * 1000).toISOString(),
      refreshTokenExpiresAt: new Date(Date.now() + refreshTokenTtl * 1000).toISOString(),
      tokenType: 'Bearer' as const,
    };
  }
}
