import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admins')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  async create(@Request() req, @Body() data: any) {
    if (req.user.role !== 'owner') {
      throw new ForbiddenException('Only owner can create admins');
    }
    return this.adminsService.create(data);
  }

  @Get()
  async findAll(@Request() req) {
    if (req.user.role !== 'owner') {
      throw new ForbiddenException('Only owner can view all admins');
    }
    return this.adminsService.findAll();
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    if (req.user.id !== id && req.user.role !== 'owner') {
      throw new ForbiddenException('You do not have permission to view this admin');
    }
    return this.adminsService.findOne(id);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateAdminDto: any) {
    if (req.user.id !== id && req.user.role !== 'owner') {
      throw new ForbiddenException('You do not have permission to update this admin');
    }
    return this.adminsService.update(id, updateAdminDto);
  }
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'owner') {
      throw new ForbiddenException('Only owner can delete admins');
    }
    return this.adminsService.remove(id);
  }
}
