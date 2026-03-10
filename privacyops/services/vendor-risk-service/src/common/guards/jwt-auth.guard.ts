import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as crypto from 'crypto';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface JwtPayload { sub: string; email: string; tenantId: string; roles: string[]; permissions?: string[]; iat: number; exp: number; }

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly jwtSecret: string;
  constructor(private readonly configService: ConfigService, private readonly reflector: Reflector) {
    this.jwtSecret = this.configService.get<string>('jwt.secret');
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Missing authorization token');
    try {
      const payload = this.verifyToken(token);
      (request as any).user = { userId: payload.sub, email: payload.email, tenantId: payload.tenantId, role: payload.roles?.[0] || 'user', permissions: payload.permissions || [], roles: payload.roles || [] };
      return true;
    } catch (error) {
      this.logger.debug(`JWT validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
  private verifyToken(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    const [headerB64, payloadB64, signatureB64] = parts;
    const expectedSignature = crypto.createHmac('sha256', this.jwtSecret).update(`${headerB64}.${payloadB64}`).digest('base64url');
    if (signatureB64 !== expectedSignature) throw new Error('Invalid token signature');
    const payload: JwtPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token has expired');
    return payload;
  }
}
