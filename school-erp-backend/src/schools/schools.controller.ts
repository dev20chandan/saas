import { Controller, Get, Post, Body, Put, Param, Delete, Query, UsePipes, ValidationPipe, UseGuards, Request, ForbiddenException, NotFoundException, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@ApiTags('Schools')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) { }

  @Post()
  @Roles('owner')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new school (owner only)' })
  @ApiResponse({ status: 201, description: 'School successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolsService.create(createSchoolDto);
  }

  @Get()
  @Roles('owner')
  @ApiOperation({ summary: 'Get all schools with pagination, filter, and search options (owner only)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for school name, email, or subdomain' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter schools by status (e.g., active, suspended, pending)' })
  @ApiQuery({ name: 'plan', required: false, description: 'Filter schools by plan (e.g., Basic, Standard, Premium)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of schools per page' })
  @ApiResponse({ status: 200, description: 'Schools list retrieved successfully.' })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isCoaching') isCoaching?: string,
  ) {
    return this.schoolsService.findAll({
      search,
      status,
      plan,
      isCoaching: isCoaching === 'true' ? true : isCoaching === 'false' ? false : false,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 8,
    });
  }

  @Get('stats')
  @Roles('owner')
  @ApiOperation({ summary: 'Get school dashboard/analytical stats (owner only)' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully.' })
  getStats() {
    return this.schoolsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get school details by ID' })
  @ApiParam({ name: 'id', description: 'School ID or Code' })
  @ApiResponse({ status: 200, description: 'School retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have access to this school.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  async findOne(@Request() req, @Param('id') id: string) {
    let school = await this.schoolsService.findOne(id).catch(() => null);
    if (!school) {
      school = await this.schoolsService.findByCode(id);
    }
    if (!school) {
      throw new NotFoundException(`School with ID or Code "${id}" not found`);
    }
    if (req.user.role !== 'owner' && req.user.schoolId !== school.code && req.user.schoolId !== school.id) {
      throw new ForbiddenException('You do not have access to this school');
    }
    return school;
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update school details by ID' })
  @ApiParam({ name: 'id', description: 'School ID or Code' })
  @ApiResponse({ status: 200, description: 'School successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have access to this school.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  async update(@Request() req, @Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    let school = await this.schoolsService.findOne(id).catch(() => null);
    if (!school) {
      school = await this.schoolsService.findByCode(id);
    }
    if (!school) {
      throw new NotFoundException(`School with ID or Code "${id}" not found`);
    }
    if (req.user.role !== 'owner' && req.user.schoolId !== school.code && req.user.schoolId !== school.id) {
      throw new ForbiddenException('You do not have access to this school');
    }
    // Prevent non-owner from changing core plan billing metrics or Board validation code
    if (req.user.role !== 'owner') {
      delete (updateSchoolDto as any).plan;
      delete (updateSchoolDto as any).status;
      delete (updateSchoolDto as any).code;
    }
    return this.schoolsService.update(school.id, updateSchoolDto);
  }

  @Delete(':id')
  @Roles('owner')
  @ApiOperation({ summary: 'Delete school by ID (owner only)' })
  @ApiParam({ name: 'id', description: 'School ID' })
  @ApiResponse({ status: 200, description: 'School successfully deleted.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  remove(@Param('id') id: string) {
    return this.schoolsService.remove(id);
  }
}
