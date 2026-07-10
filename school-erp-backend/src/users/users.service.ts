import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  private async resolveSchoolMeta(schoolId: string, providedName?: string) {
    let schoolName = providedName || 'All Schools';
    let schoolUuid: string | null = null;

    if (schoolId !== 'ALL') {
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

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const schoolId = createUserDto.schoolId || 'ALL';
    const { schoolName, schoolUuid } = await this.resolveSchoolMeta(schoolId, createUserDto.school);

    const data: any = {
      name: createUserDto.name,
      email,
      password: passwordHash,
      role: createUserDto.role || 'Teacher',
      schoolId,
      schoolUuid,
      schoolName,
      operator: createUserDto.operator,
      status: createUserDto.status || 'Active',
      phone: createUserDto.phone,
      settings: createUserDto.settings || {},
    };

    return this.prisma.user.create({ data });
  }

  async findAll(query: {
    search?: string;
    role?: string;
    status?: string;
    schoolId?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, role, status, schoolId, page = 1, limit = 8 } = query;
    const where: any = {};

    if (schoolId && schoolId !== 'ALL') {
      where.schoolId = schoolId;
    }

    if (role && role !== 'All') {
      where.role = role;
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { schoolName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const updateData: any = {};
    const writableFields = ['name', 'email', 'role', 'operator', 'status', 'phone', 'settings'];
    for (const field of writableFields) {
      if ((updateUserDto as any)[field] !== undefined) {
        updateData[field] = (updateUserDto as any)[field];
      }
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    if (updateUserDto.schoolId) {
      updateData.schoolId = updateUserDto.schoolId;
      if (updateUserDto.schoolId === 'ALL') {
        updateData.schoolName = 'All Schools';
        updateData.schoolUuid = null;
      } else {
        const { schoolName, schoolUuid } = await this.resolveSchoolMeta(
          updateUserDto.schoolId,
          updateUserDto.school,
        );
        updateData.schoolName = schoolName;
        updateData.schoolUuid = schoolUuid;
      }
    } else if (updateUserDto.school) {
      updateData.schoolName = updateUserDto.school;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.prisma.user.findUnique({ where: { id } });
    return this.prisma.user.delete({ where: { id } });
  }

  async getStats(schoolId?: string) {
    const where: any = {};
    if (schoolId && schoolId !== 'ALL') {
      where.schoolId = schoolId;
    }

    const statsArray = await this.prisma.user.groupBy({
      by: ['status'],
      where,
      _count: {
        _all: true,
      },
    });

    const stats = {
      total: 0,
      active: 0,
      pending: 0,
      locked: 0,
      inactive: 0,
    };

    statsArray.forEach((item) => {
      const status = item.status?.toLowerCase();
      if (status === 'active') stats.active = item._count._all;
      else if (status === 'pending') stats.pending = item._count._all;
      else if (status === 'locked') stats.locked = item._count._all;
      else if (status === 'inactive') stats.inactive = item._count._all;
    });

    stats.total = await this.prisma.user.count({ where });

    return stats;
  }
}
