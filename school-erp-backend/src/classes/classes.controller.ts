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
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Classes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles('owner', 'Admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new class track' })
  async create(@Request() req, @Body() createClassDto: CreateClassDto) {
    const schoolId = req.user.role === 'Admin' ? req.user.schoolId : (createClassDto.schoolId || 'ALL');
    return this.classesService.create(schoolId, createClassDto);
  }

  @Get()
  @Roles('owner', 'Admin', 'Teacher')
  @ApiOperation({ summary: 'Get all class tracks' })
  async findAll(@Request() req) {
    const schoolId = req.user.role === 'owner' ? 'ALL' : req.user.schoolId;
    return this.classesService.findAll(schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get class track details' })
  async findOne(@Request() req, @Param('id') id: string) {
    const record = await this.classesService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return record;
  }

  @Put(':id')
  @Roles('owner', 'Admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update class track details' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    const record = await this.classesService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @Roles('owner', 'Admin')
  @ApiOperation({ summary: 'Delete class track' })
  async remove(@Request() req, @Param('id') id: string) {
    const record = await this.classesService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return this.classesService.remove(id);
  }
}
