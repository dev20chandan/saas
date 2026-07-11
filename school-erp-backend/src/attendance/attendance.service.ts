import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAttendanceDto } from './dto/submit-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(submitAttendanceDto: SubmitAttendanceDto) {
    const { date, schoolId, records } = submitAttendanceDto;
    const results: any[] = [];

    for (const record of records) {
      const studentId = record.studentId;
      const status = record.status;

      // 1. Upsert attendance record for student + date
      const existing = await this.prisma.attendance.findFirst({
        where: {
          studentId,
          date,
        },
      });

      let attendanceRecord;
      if (existing) {
        attendanceRecord = await this.prisma.attendance.update({
          where: { id: existing.id },
          data: { status },
        });
      } else {
        attendanceRecord = await this.prisma.attendance.create({
          data: {
            studentId,
            status,
            date,
            schoolId: schoolId!,
          },
        });
      }

      results.push(attendanceRecord);

      // 2. Compute dynamic attendanceRate for the student
      const totalLogs = await this.prisma.attendance.count({
        where: { studentId },
      });
      const presentLogs = await this.prisma.attendance.count({
        where: {
          studentId,
          status: { in: ['Present', 'Late'] },
        },
      });

      const attendanceRate = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 100;

      // Update student table record
      await this.prisma.student.update({
        where: { id: studentId },
        data: { attendanceRate },
      });
    }

    return {
      message: 'Attendance processed successfully',
      count: results.length,
    };
  }

  async getLogs(date: string, schoolId: string, className?: string) {
    const where: any = {
      date,
      schoolId,
    };

    if (className) {
      where.student = {
        className,
      };
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        student: true,
      },
    });
  }
}
