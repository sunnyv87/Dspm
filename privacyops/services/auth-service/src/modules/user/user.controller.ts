import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  findAll(@Req() req: any) { return this.service.findByTenant(req.user.tenantId); }

  @Get(':id')
  findById(@Param('id') id: string, @Req() req: any) { return this.service.findById(id, req.user.tenantId); }

  @Post()
  create(@Body() data: any, @Req() req: any) { return this.service.create(req.user.tenantId, data); }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) { return this.service.update(id, req.user.tenantId, data); }

  @Post(':id/role')
  assignRole(@Param('id') id: string, @Body() body: { roleId: string }, @Req() req: any) {
    return this.service.assignRole(id, req.user.tenantId, body.roleId);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string, @Req() req: any) { return this.service.deactivate(id, req.user.tenantId); }
}
