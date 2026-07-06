import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { School } from '../../schools/schemas/school.schema';
import { User } from '../../users/schemas/user.schema';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ required: true, unique: true })
  ticketId: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  school: School;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  submitter: User;

  @Prop({ required: true, enum: ['High', 'Medium', 'Low'], default: 'Low' })
  priority: string;

  @Prop({ required: true, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' })
  status: string;

  @Prop({ required: true })
  description: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
