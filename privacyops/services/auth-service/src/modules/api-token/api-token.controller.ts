import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiTokenService } from './api-token.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('API Tokens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api-tokens')
export class ApiTokenController {
  constructor(private service: ApiTokenService) {}

  @Get()
  findAll(@Req() req: any) { return this.service.findByTenant(req.user.tenantId); }

  @Get(':id')
  findById(@Param('id') id: string, @Req() req: any) { return this.service.findById(id, req.user.tenantId); }

  @Post()
  create(@Body() data: { name: string; scopes: string[]; expiresAt: Date }, @Req() req: any) {
    return this.service.create(req.user.tenantId, req.user.userId, data);
  }

  @Delete(':id')
  revoke(@Param('id') id: string, @Req() req: any) { return this.service.revoke(id, req.user.tenantId); }
}
