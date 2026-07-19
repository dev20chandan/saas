import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Subjects')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles('owner', 'Admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new subject' })
  async create(@Request() req, @Body() createSubjectDto: CreateSubjectDto) {
    const schoolId = req.user.role === 'Admin' ? req.user.schoolId : (createSubjectDto.schoolId || 'ALL');
    return this.subjectsService.create(schoolId, createSubjectDto);
  }

  @Get()
  @Roles('owner', 'Admin', 'Teacher')
  @ApiOperation({ summary: 'Get all subjects' })
  async findAll(@Request() req) {
    const schoolId = req.user.role === 'owner' ? 'ALL' : req.user.schoolId;
    return this.subjectsService.findAll(schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subject details' })
  async findOne(@Request() req, @Param('id') id: string) {
    const record = await this.subjectsService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return record;
  }

  @Put(':id')
  @Roles('owner', 'Admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update subject details' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    const record = await this.subjectsService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @Roles('owner', 'Admin')
  @ApiOperation({ summary: 'Delete subject' })
  async remove(@Request() req, @Param('id') id: string) {
    const record = await this.subjectsService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return this.subjectsService.remove(id);
  }
}
