import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveSchoolMeta(schoolId: string, providedSchoolName?: string) {
    let schoolName = providedSchoolName || 'All Schools';
    let schoolUuid: string | null = null;

    if (schoolId !== 'ALL' && schoolId) {
      const school = await this.prisma.school.findFirst({
        where: {
          OR: [{ id: schoolId }, { code: schoolId }],
        },
      });

      if (school) {
        schoolName = school.name;
        schoolUuid = school.id;
      }
    }

    return { schoolName, schoolUuid };
  }

  public mapStudent(student: any) {
    if (!student) return null;
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      status: student.status,
      schoolId: student.schoolId,
      schoolUuid: student.schoolUuid,
      schoolName: student.schoolName,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      // Flat properties:
      rollNumber: student.rollNumber,
      className: student.className,
      guardianName: student.guardianName,
      dob: student.dob,
      gender: student.gender,
      bloodGroup: student.bloodGroup,
      feeStatus: student.feeStatus,
      attendanceRate: student.attendanceRate,
      // Nested legacy settings field for backwards compatibility:
      settings: {
        rollNumber: student.rollNumber,
        className: student.className,
        guardianName: student.guardianName,
        dob: student.dob,
        gender: student.gender,
        bloodGroup: student.bloodGroup,
        feeStatus: student.feeStatus,
        attendanceRate: student.attendanceRate,
      },
    };
  }

  async create(createStudentDto: CreateStudentDto): Promise<any> {
    if (createStudentDto.email) {
      const email = createStudentDto.email.toLowerCase();
      const existing = await this.prisma.student.findUnique({ where: { email } });
      if (existing) {
        throw new BadRequestException('Student with this email already exists');
      }
    }

    let passwordHash: string | null = null;
    if (createStudentDto.password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(createStudentDto.password, salt);
    }

    const schoolId = createStudentDto.schoolId || 'ALL';
    const { schoolName, schoolUuid } = await this.resolveSchoolMeta(schoolId);

    const rollNumber = createStudentDto.rollNumber ?? createStudentDto.settings?.rollNumber ?? '';
    const className = createStudentDto.className ?? createStudentDto.settings?.className ?? '';
    const guardianName = createStudentDto.guardianName ?? createStudentDto.settings?.guardianName ?? '';
    const dob = createStudentDto.dob ?? createStudentDto.settings?.dob ?? '';
    const gender = createStudentDto.gender ?? createStudentDto.settings?.gender ?? 'Male';
    const bloodGroup = createStudentDto.bloodGroup ?? createStudentDto.settings?.bloodGroup ?? 'O+';
    const feeStatus = createStudentDto.feeStatus ?? createStudentDto.settings?.feeStatus ?? 'Pending';
    const attendanceRate = createStudentDto.attendanceRate ?? createStudentDto.settings?.attendanceRate ?? 95;

    const data: any = {
      name: createStudentDto.name,
      email: createStudentDto.email?.toLowerCase() || null,
      password: passwordHash,
      phone: createStudentDto.phone,
      status: createStudentDto.status || 'Active',
      schoolId,
      schoolUuid,
      schoolName,
      rollNumber,
      className,
      guardianName,
      dob,
      gender,
      bloodGroup,
      feeStatus,
      attendanceRate,
    };

    const student = await this.prisma.student.create({ data });
    return this.mapStudent(student);
  }

  async findAll(query: {
    search?: string;
    className?: string;
    status?: string;
    schoolId?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, className, status, schoolId, page = 1, limit = 8 } = query;
    const where: any = {};

    if (schoolId && schoolId !== 'ALL') {
      where.schoolId = schoolId;
    }

    if (className) {
      where.className = className;
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { guardianName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [students, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      users: students.map(s => this.mapStudent(s)),
      total,
    };
  }

  async findOne(id: string): Promise<any> {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }
    return this.mapStudent(student);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<any> {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }

    const updateData: any = {};
    const writableFields = [
      'name',
      'email',
      'phone',
      'status',
      'rollNumber',
      'className',
      'guardianName',
      'dob',
      'gender',
      'bloodGroup',
      'feeStatus',
      'attendanceRate',
    ];

    for (const field of writableFields) {
      if ((updateStudentDto as any)[field] !== undefined) {
        updateData[field] = (updateStudentDto as any)[field];
      }
    }

    if (updateStudentDto.settings) {
      for (const field of writableFields) {
        if (updateStudentDto.settings[field] !== undefined) {
          updateData[field] = updateStudentDto.settings[field];
        }
      }
    }

    if (updateStudentDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateStudentDto.password, salt);
    }

    if (updateStudentDto.schoolId) {
      updateData.schoolId = updateStudentDto.schoolId;
      const { schoolName, schoolUuid } = await this.resolveSchoolMeta(updateStudentDto.schoolId);
      updateData.schoolName = schoolName;
      updateData.schoolUuid = schoolUuid;
    }

    const updated = await this.prisma.student.update({
      where: { id },
      data: updateData,
    });

    return this.mapStudent(updated);
  }

  async remove(id: string): Promise<any> {
    await this.prisma.student.findUnique({ where: { id } });
    const deleted = await this.prisma.student.delete({ where: { id } });
    return this.mapStudent(deleted);
  }
}
