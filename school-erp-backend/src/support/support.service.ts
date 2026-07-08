import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.ticket.findMany({
      include: {
        school: true,
        submitter: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (items.length > 0) {
      return items.map((ticket) => ({
        ...ticket,
        schoolName: ticket.school?.name,
        submitter: ticket.submitter?.name,
      }));
    }

    return [
      {
        ticketId: 'TKT-1042',
        subject: 'Login issue for parents portal',
        schoolName: 'Greenfield International',
        submitter: 'Rahul Sharma',
        priority: 'High',
        status: 'Open',
        date: 'Just now',
        description: 'Parents are reporting they cannot log into the portal. They are getting a 500 error after entering credentials.',
      },
      {
        ticketId: 'TKT-1041',
        subject: 'Need help with bulk student upload',
        schoolName: 'Sunrise Public School',
        submitter: 'Anita Desai',
        priority: 'Medium',
        status: 'In Progress',
        date: '2 hours ago',
        description: 'I am trying to upload a CSV of 500 new students but it fails at row 250. Can you please check the attached file?',
      },
    ];
  }
}
