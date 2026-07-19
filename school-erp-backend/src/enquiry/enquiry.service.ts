import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';

@Injectable()
export class EnquiryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateEnquiryDto) {
    return this.prisma.admissionEnquiry.create({
      data: {
        studentName: dto.studentName,
        parentName: dto.parentName,
        phone: dto.phone,
        email: dto.email || null,
        address: dto.address || null,
        course: dto.course,
        className: dto.className,
        source: dto.source || 'Walk-In',
        status: dto.status || 'New',
        remarks: dto.remarks || null,
        followUpDate: dto.followUpDate || null,
        assignedTo: dto.assignedTo || null,
        schoolId,
      },
    });
  }

  async findAll(schoolId: string) {
    const where: any = {};
    if (schoolId && schoolId !== 'ALL') {
      where.schoolId = schoolId;
    }
    return this.prisma.admissionEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.admissionEnquiry.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Enquiry with ID "${id}" not found`);
    return record;
  }

  async update(id: string, dto: UpdateEnquiryDto) {
    await this.findOne(id);
    return this.prisma.admissionEnquiry.update({
      where: { id },
      data: {
        studentName: dto.studentName,
        parentName: dto.parentName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        course: dto.course,
        className: dto.className,
        source: dto.source,
        status: dto.status,
        remarks: dto.remarks,
        followUpDate: dto.followUpDate,
        assignedTo: dto.assignedTo,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.admissionEnquiry.delete({ where: { id } });
  }
}
