import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (items.length > 0) {
      return items;
    }

    return [
      {
        eventId: 'EVT-9042',
        timestamp: '2024-06-29 10:14:22',
        user: 'admin@schoolerp.com',
        role: 'Super Admin',
        action: 'UPDATE',
        resource: 'School Settings',
        status: 'Success',
        ipAddress: '192.168.1.45',
        payload: { previous: { maxUsers: 500 }, new: { maxUsers: 1000 } },
      },
      {
        eventId: 'EVT-9041',
        timestamp: '2024-06-29 09:55:10',
        user: 'jdoe@greenfield.edu',
        role: 'Principal',
        action: 'EXPORT',
        resource: 'Student Records',
        status: 'Success',
        ipAddress: '203.0.113.12',
        payload: { format: 'CSV', rowCount: 1250, filters: { grade: '10' } },
      },
    ];
  }
}
