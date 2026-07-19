import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, createTimetableDto: CreateTimetableDto) {
    return this.prisma.timetable.create({
      data: {
        className: createTimetableDto.className,
        dayOfWeek: createTimetableDto.dayOfWeek,
        subjectName: createTimetableDto.subjectName,
        startTime: createTimetableDto.startTime,
        endTime: createTimetableDto.endTime,
        teacherName: createTimetableDto.teacherName,
        roomNumber: createTimetableDto.roomNumber,
        schoolId: schoolId || createTimetableDto.schoolId || 'ALL',
      },
    });
  }

  async findAll(schoolId: string) {
    const where: any = {};
    if (schoolId && schoolId !== 'ALL') {
      where.schoolId = schoolId;
    }
    return this.prisma.timetable.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.timetable.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`Timetable slot with ID "${id}" not found`);
    }
    return record;
  }

  async update(id: string, updateTimetableDto: UpdateTimetableDto) {
    await this.findOne(id);
    return this.prisma.timetable.update({
      where: { id },
      data: {
        className: updateTimetableDto.className,
        dayOfWeek: updateTimetableDto.dayOfWeek,
        subjectName: updateTimetableDto.subjectName,
        startTime: updateTimetableDto.startTime,
        endTime: updateTimetableDto.endTime,
        teacherName: updateTimetableDto.teacherName,
        roomNumber: updateTimetableDto.roomNumber,
        schoolId: updateTimetableDto.schoolId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.timetable.delete({
      where: { id },
    });
  }
}
