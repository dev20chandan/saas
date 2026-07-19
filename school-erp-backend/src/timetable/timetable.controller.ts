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
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Timetable')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @Roles('owner', 'Admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new timetable slot' })
  async create(@Request() req, @Body() createTimetableDto: CreateTimetableDto) {
    const schoolId = req.user.role === 'Admin' ? req.user.schoolId : (createTimetableDto.schoolId || 'ALL');
    return this.timetableService.create(schoolId, createTimetableDto);
  }

  @Get()
  @Roles('owner', 'Admin', 'Teacher')
  @ApiOperation({ summary: 'Get all active timetable slots' })
  async findAll(@Request() req) {
    const schoolId = req.user.role === 'owner' ? 'ALL' : req.user.schoolId;
    return this.timetableService.findAll(schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get timetable slot details' })
  async findOne(@Request() req, @Param('id') id: string) {
    const record = await this.timetableService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return record;
  }

  @Put(':id')
  @Roles('owner', 'Admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update timetable slot details' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTimetableDto: UpdateTimetableDto,
  ) {
    const record = await this.timetableService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return this.timetableService.update(id, updateTimetableDto);
  }

  @Delete(':id')
  @Roles('owner', 'Admin')
  @ApiOperation({ summary: 'Delete timetable slot' })
  async remove(@Request() req, @Param('id') id: string) {
    const record = await this.timetableService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return this.timetableService.remove(id);
  }
}
