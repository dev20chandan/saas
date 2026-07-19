import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Request, UseGuards, UsePipes, ValidationPipe, ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnquiryService } from './enquiry.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admission Enquiry')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enquiry')
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  @Post()
  @Roles('owner', 'Admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new admission enquiry' })
  async create(@Request() req, @Body() dto: CreateEnquiryDto) {
    const schoolId = req.user.role === 'Admin' ? req.user.schoolId : (dto.schoolId || 'ALL');
    return this.enquiryService.create(schoolId, dto);
  }

  @Get()
  @Roles('owner', 'Admin', 'Teacher')
  @ApiOperation({ summary: 'Get all enquiries for the school' })
  async findAll(@Request() req) {
    const schoolId = req.user.role === 'owner' ? 'ALL' : req.user.schoolId;
    return this.enquiryService.findAll(schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enquiry details' })
  async findOne(@Request() req, @Param('id') id: string) {
    const record = await this.enquiryService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return record;
  }

  @Put(':id')
  @Roles('owner', 'Admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update enquiry status or details' })
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateEnquiryDto) {
    const record = await this.enquiryService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return this.enquiryService.update(id, dto);
  }

  @Delete(':id')
  @Roles('owner', 'Admin')
  @ApiOperation({ summary: 'Delete enquiry record' })
  async remove(@Request() req, @Param('id') id: string) {
    const record = await this.enquiryService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== record.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return this.enquiryService.remove(id);
  }
}
