import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  generateSchoolCode(): string {
    const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `SCH-${randomSuffix}`;
  }

  async create(createSchoolDto: CreateSchoolDto) {
    const { adminName, adminEmail, adminPassword, adminPhone, operator, ...schoolData } = createSchoolDto;
    const code = schoolData.code?.trim() || this.generateSchoolCode();
    
    const school = await this.prisma.school.create({
      data: {
        ...schoolData,
        code,
        status: schoolData.status || 'Trial',
        operator,
      },
    });

    if (adminName && adminEmail && adminPassword) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await this.prisma.admin.create({
        data: {
          name: adminName,
          email: adminEmail.toLowerCase(),
          password: hashedPassword,
          role: 'Admin',
          schoolId: school.id,
          schoolName: school.name,
          phone: adminPhone,
          operator: operator,
        }
      });
    }

    return school;
  }

  async findAll(query: {
    search?: string;
    status?: string;
    plan?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, plan, page = 1, limit = 8 } = query;
    const where: any = {};

    if (status && status !== 'All') {
      where.status = status;
    }

    if (plan && plan !== 'All') {
      where.plan = plan;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [schools, total] = await Promise.all([
      this.prisma.school.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.school.count({ where }),
    ]);

    return { schools, total };
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }
    return school;
  }

  async findByCode(code: string) {
    return this.prisma.school.findUnique({ where: { code } });
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }

    const data: any = {};
    const writableFields = [
      'name',
      'code',
      'type',
      'city',
      'state',
      'address',
      'principal',
      'plan',
      'status',
      'students',
      'teachers',
      'email',
      'phone',
      'operator',
      'joined',
    ];
    for (const field of writableFields) {
      if ((updateSchoolDto as any)[field] !== undefined) {
        data[field] = (updateSchoolDto as any)[field];
      }
    }

    if (data.code !== undefined) {
      data.code = data.code?.trim() || this.generateSchoolCode();
    }

    return this.prisma.school.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }
    return this.prisma.school.delete({ where: { id } });
  }

  async getStats() {
    const statsArray = await this.prisma.school.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    const stats = {
      total: 0,
      active: 0,
      trial: 0,
      expired: 0,
      suspended: 0,
    };

    statsArray.forEach((item) => {
      const status = item.status?.toLowerCase();
      if (status === 'active') stats.active = item._count._all;
      else if (status === 'trial') stats.trial = item._count._all;
      else if (status === 'expired') stats.expired = item._count._all;
      else if (status === 'suspended') stats.suspended = item._count._all;
    });

    stats.total = await this.prisma.school.count();

    return stats;
  }

  async getSchoolsGrowth() {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 14);

    const schools = await this.prisma.school.findMany({
      where: {
        createdAt: {
          gte: fifteenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const histogram = new Map<string, number>();
    schools.forEach((school) => {
      const dateKey = school.createdAt.toISOString().slice(0, 10);
      histogram.set(dateKey, (histogram.get(dateKey) ?? 0) + 1);
    });

    const result: Array<{ date: string; count: number }> = [];
    for (let daysAgo = 14; daysAgo >= 0; daysAgo -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const label = date.toISOString().slice(0, 10);
      result.push({ date: label, count: histogram.get(label) ?? 0 });
    }

    return result;
  }
}
