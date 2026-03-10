import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubjectService } from './subject.service';
import { RegisterSubjectDto } from './dto/register-subject.dto';
import { QuerySubjectDto } from './dto/query-subject.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Subjects')
@ApiBearerAuth('bearer')
@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @Permissions('rights.manage')
  @ApiOperation({ summary: 'Register a new data subject' })
  @ApiResponse({ status: 201, description: 'Subject registered successfully' })
  @ApiResponse({ status: 409, description: 'Subject with this email already exists' })
  async register(
    @TenantId() tenantId: string,
    @Body() dto: RegisterSubjectDto,
  ) {
    return this.subjectService.register(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List data subjects for tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of subjects' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QuerySubjectDto,
  ) {
    return this.subjectService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a data subject by ID' })
  @ApiResponse({ status: 200, description: 'Subject found' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async findById(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.subjectService.findById(tenantId, id);
  }
}
