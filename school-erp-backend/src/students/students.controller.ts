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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles('owner', 'Admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new student (owner or Admin only)' })
  async create(@Request() req, @Body() createStudentDto: CreateStudentDto) {
    if (req.user.role === 'Admin') {
      createStudentDto.schoolId = req.user.schoolId;
    }
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles('owner', 'Admin', 'Teacher')
  @ApiOperation({ summary: 'Get all students' })
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('className') className?: string,
    @Query('status') status?: string,
    @Query('schoolId') schoolId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    let targetSchoolId = schoolId;
    if (req.user.role === 'Admin' || req.user.role === 'Teacher') {
      targetSchoolId = req.user.schoolId;
    }
    const limitNum = limit ? parseInt(limit, 10) : 100;
    
    // Support limit parameter matching users API
    return this.studentsService.findAll({
      search,
      className,
      status,
      schoolId: targetSchoolId,
      page: page ? parseInt(page, 10) : 1,
      limit: limitNum,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student details by ID' })
  async findOne(@Request() req, @Param('id') id: string) {
    const student = await this.studentsService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== student.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return student;
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update student' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    const targetStudent = await this.studentsService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== targetStudent.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles('owner', 'Admin')
  @ApiOperation({ summary: 'Delete student' })
  async remove(@Request() req, @Param('id') id: string) {
    const targetStudent = await this.studentsService.findOne(id);
    if (req.user.role !== 'owner' && req.user.schoolId !== targetStudent.schoolId) {
      throw new ForbiddenException('Access denied');
    }
    return this.studentsService.remove(id);
  }
}
