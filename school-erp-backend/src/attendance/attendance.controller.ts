import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { SubmitAttendanceDto } from './dto/submit-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Attendance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('submit')
  @Roles('owner', 'Admin', 'Teacher')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Submit today\'s attendance for students' })
  async submit(@Request() req, @Body() submitAttendanceDto: SubmitAttendanceDto) {
    if (req.user.role === 'Admin' || req.user.role === 'Teacher') {
      submitAttendanceDto.schoolId = req.user.schoolId;
    }
    if (!submitAttendanceDto.schoolId) {
      throw new BadRequestException('schoolId should not be empty');
    }
    return this.attendanceService.submit(submitAttendanceDto);
  }

  @Get()
  @Roles('owner', 'Admin', 'Teacher')
  @ApiOperation({ summary: 'Get student attendance logs' })
  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'className', required: false })
  async getLogs(
    @Request() req,
    @Query('date') date: string,
    @Query('schoolId') schoolId?: string,
    @Query('className') className?: string,
  ) {
    let targetSchoolId = schoolId || req.user.schoolId;
    if (req.user.role === 'Admin' || req.user.role === 'Teacher') {
      targetSchoolId = req.user.schoolId;
    }
    return this.attendanceService.getLogs(date, targetSchoolId, className);
  }
}
