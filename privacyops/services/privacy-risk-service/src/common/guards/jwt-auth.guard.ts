import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly jwtSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private reflector: Reflector,
  ) {
    this.jwtSecret = this.configService.get<string>('jwt.secret');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Missing authorization token');

    try {
      const payload = this.verifyToken(token);
      (request as any).user = {
        userId: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        role: payload.roles?.[0] || 'viewer',
        roles: payload.roles || [],
        permissions: payload.permissions || [],
        sessionJti: payload.jti || '',
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | null {
    const [type, token] = (request.headers.authorization || '').split(' ');
    return type === 'Bearer' ? token : null;
  }

  private verifyToken(token: string): any {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64)
      throw new Error('Invalid token format');

    const expectedSig = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');
    if (signatureB64 !== expectedSig) throw new Error('Invalid signature');

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8'),
    );
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000))
      throw new Error('Token expired');

    return payload;
  }
}
