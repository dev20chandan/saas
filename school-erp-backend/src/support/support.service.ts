import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async findAll(): Promise<any[]> {
    const items = await this.ticketModel.find().populate('school').populate('submitter').exec();
    if (items.length > 0) return items;
    
    // Return mock if empty
    return [
      { ticketId: 'TKT-1042', subject: 'Login issue for parents portal', schoolName: 'Greenfield International', submitter: 'Rahul Sharma', priority: 'High', status: 'Open', date: 'Just now', description: 'Parents are reporting they cannot log into the portal. They are getting a 500 error after entering credentials.' },
      { ticketId: 'TKT-1041', subject: 'Need help with bulk student upload', schoolName: 'Sunrise Public School', submitter: 'Anita Desai', priority: 'Medium', status: 'In Progress', date: '2 hours ago', description: 'I am trying to upload a CSV of 500 new students but it fails at row 250. Can you please check the attached file?' },
    ];
  }
}
