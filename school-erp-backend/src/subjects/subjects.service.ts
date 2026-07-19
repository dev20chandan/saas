import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: {
        name: createSubjectDto.name,
        code: createSubjectDto.code,
        type: createSubjectDto.type || 'Theory',
        className: createSubjectDto.className,
        teacherName: createSubjectDto.teacherName,
        schoolId: schoolId || createSubjectDto.schoolId || 'ALL',
      },
    });
  }

  async findAll(schoolId: string) {
    const where: any = {};
    if (schoolId && schoolId !== 'ALL') {
      where.schoolId = schoolId;
    }
    return this.prisma.subject.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.subject.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`Subject with ID "${id}" not found`);
    }
    return record;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    await this.findOne(id);
    return this.prisma.subject.update({
      where: { id },
      data: {
        name: updateSubjectDto.name,
        code: updateSubjectDto.code,
        type: updateSubjectDto.type,
        className: updateSubjectDto.className,
        teacherName: updateSubjectDto.teacherName,
        schoolId: updateSubjectDto.schoolId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
