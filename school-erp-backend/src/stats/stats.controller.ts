import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Stats')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overview dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully.' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'School parameter (System Admin only)' })
  getDashboardStats(@Request() req, @Query('schoolId') schoolId?: string) {
    // If user is a System Admin, they can filter by any schoolId, else restrict to request user's schoolId
    const targetSchoolId = req.user.role === 'System Admin' ? (schoolId || 'ALL') : req.user.schoolId;
    return this.statsService.getDashboardStats(targetSchoolId);
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get recent activities/logs' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of activity logs to return (default 5)' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'School parameter (System Admin only)' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully.' })
  getRecentActivities(@Request() req, @Query('limit') limit?: string, @Query('schoolId') schoolId?: string) {
    const targetSchoolId = req.user.role === 'System Admin' ? schoolId : req.user.schoolId;
    return this.statsService.getRecentActivities(
      limit ? parseInt(limit, 10) : 5,
      targetSchoolId,
    );
  }

  @Post('activities')
  @ApiOperation({ summary: 'Log a new recent activity' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'info' },
        text: { type: 'string', example: 'Admin logged in' },
        color: { type: 'string', example: 'blue' },
      },
      required: ['type', 'text', 'color'],
    },
  })
  @ApiResponse({ status: 201, description: 'Activity successfully logged.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  logActivity(
    @Request() req,
    @Body('type') type: string,
    @Body('text') text: string,
    @Body('color') color: string,
  ) {
    // Log with the user's schoolId context
    return this.statsService.logActivity(type, text, color, req.user.schoolId);
  }
}
