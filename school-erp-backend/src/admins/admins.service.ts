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

  async update(id: string, data: any) {
    return this.prisma.admin.update({
      where: { id },
      data,
    });
  }
}
