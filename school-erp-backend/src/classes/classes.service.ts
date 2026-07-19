import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, createClassDto: CreateClassDto) {
    return this.prisma.class.create({
      data: {
        name: createClassDto.name,
        roomNumber: createClassDto.roomNumber,
        teacherId: createClassDto.teacherId || null,
        teacherName: createClassDto.teacherName,
        subjects: createClassDto.subjects,
        schoolId: schoolId || createClassDto.schoolId || 'ALL',
      },
    });
  }

  async findAll(schoolId: string) {
    const where: any = {};
    if (schoolId && schoolId !== 'ALL') {
      where.schoolId = schoolId;
    }
    return this.prisma.class.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.class.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`Class with ID "${id}" not found`);
    }
    return record;
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    await this.findOne(id);
    return this.prisma.class.update({
      where: { id },
      data: {
        name: updateClassDto.name,
        roomNumber: updateClassDto.roomNumber,
        teacherId: updateClassDto.teacherId,
        teacherName: updateClassDto.teacherName,
        subjects: updateClassDto.subjects,
        schoolId: updateClassDto.schoolId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.class.delete({
      where: { id },
    });
  }
}
