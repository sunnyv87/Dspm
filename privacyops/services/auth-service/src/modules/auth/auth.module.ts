import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../../entities/user.entity';
import { Session } from '../../entities/session.entity';
import { Tenant } from '../../entities/tenant.entity';
import { Role } from '../../entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, Tenant, Role]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get('jwt.secret'),
        signOptions: { expiresIn: cs.get<number>('jwt.accessTokenTtl') || 900 },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
