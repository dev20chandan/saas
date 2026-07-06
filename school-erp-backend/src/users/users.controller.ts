import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('System Admin', 'School Admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new user (System Admin or School Admin only)' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {
    if (req.user.role === 'School Admin') {
      createUserDto.schoolId = req.user.schoolId;
      if (createUserDto.role === 'System Admin') {
        throw new ForbiddenException('School Admins cannot create System Admin users');
      }
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('System Admin', 'School Admin')
  @ApiOperation({ summary: 'Get all users with filter, search, and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for user name or email' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter users by role (e.g., superadmin, admin, schooladmin, teacher, student)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter users by activity status (e.g., active, inactive)' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filter users by associated school ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of users per page' })
  @ApiResponse({ status: 200, description: 'Users list retrieved successfully.' })
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('schoolId') schoolId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    let targetSchoolId = schoolId;
    if (req.user.role === 'School Admin') {
      targetSchoolId = req.user.schoolId;
    }
    return this.usersService.findAll({
      search,
      role,
      status,
      schoolId: targetSchoolId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 8,
    });
  }

  @Get('stats')
  @Roles('System Admin', 'School Admin')
  @ApiOperation({ summary: 'Get user dashboard statistics, optionally filtered by school ID' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Associated school ID filter' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully.' })
  getStats(@Request() req, @Query('schoolId') schoolId?: string) {
    const targetSchoolId = req.user.role === 'System Admin' ? schoolId : req.user.schoolId;
    return this.usersService.getStats(targetSchoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have access to this user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Request() req, @Param('id') id: string) {
    if (req.user.id === id) {
      return this.usersService.findOne(id);
    }
    if (req.user.role !== 'System Admin' && req.user.role !== 'School Admin') {
      throw new ForbiddenException('You do not have access to view this user');
    }
    const userObj = await this.usersService.findOne(id);
    if (req.user.role === 'School Admin' && userObj.schoolId !== req.user.schoolId) {
      throw new ForbiddenException('You do not have access to view users outside your school');
    }
    return userObj;
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update user details by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(@Request() req, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const targetUser = await this.usersService.findOne(id);
    const isSelfUpdate = req.user.id === id;

    if (!isSelfUpdate && req.user.role !== 'System Admin' && req.user.role !== 'School Admin') {
      throw new ForbiddenException('You do not have permission to update this user');
    }

    if (req.user.role === 'School Admin' && !isSelfUpdate) {
      if (targetUser.schoolId !== req.user.schoolId) {
        throw new ForbiddenException('You can only update users belonging to your school');
      }
      if (targetUser.role === 'System Admin') {
        throw new ForbiddenException('School Admins cannot modify System Admin users');
      }
    }

    // Strip sensitive field changes for self-updates or non-platform admins
    if (!isSelfUpdate && req.user.role !== 'System Admin') {
      // School admin editing another user
      delete (updateUserDto as any).schoolId;
      if (updateUserDto.role === 'System Admin') {
        delete (updateUserDto as any).role;
      }
    } else if (isSelfUpdate && req.user.role !== 'System Admin') {
      // Regular user updating their own profile
      delete (updateUserDto as any).role;
      delete (updateUserDto as any).schoolId;
      delete (updateUserDto as any).status;
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('System Admin', 'School Admin')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async remove(@Request() req, @Param('id') id: string) {
    if (id === req.user.id) {
      throw new BadRequestException('You cannot delete your own account');
    }
    const targetUser = await this.usersService.findOne(id);

    if (req.user.role === 'School Admin') {
      if (targetUser.schoolId !== req.user.schoolId) {
        throw new ForbiddenException('You can only delete users belonging to your school');
      }
      if (targetUser.role === 'System Admin' || targetUser.role === 'School Admin') {
        throw new ForbiddenException('School Admins cannot delete other management administrators');
      }
    }
    return this.usersService.remove(id);
  }
}

