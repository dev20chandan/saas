import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async create(data: any) {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const { permissions, ...restData } = data;
    return this.prisma.admin.create({
      data: {
        ...restData,
        password: hashedPassword,
        email: data.email.toLowerCase(),
        settings: { permissions },
      },
    });
  }

  async findAll() {
    return this.prisma.admin.findMany({
      where: {
        role: { not: 'owner' },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        settings: true,
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.admin.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    if (data.password) {
      const bcrypt = require('bcrypt');
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    let updateData = { ...data };
    if (updateData.permissions) {
      const { permissions, ...restData } = updateData;
      updateData = { ...restData, settings: { permissions } };
    }
    
    return this.prisma.admin.update({
      where: { id },
      data: updateData,
    });
  }
  async remove(id: string) {
    return this.prisma.admin.delete({
      where: { id },
    });
  }
}
