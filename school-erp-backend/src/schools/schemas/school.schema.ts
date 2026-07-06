import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SchoolDocument = School & Document;

@Schema({ timestamps: true })
export class School {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true, default: 'CBSE' })
  type: string; // CBSE, ICSE, IB, State Board, etc.

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop()
  address: string;

  @Prop({ required: true })
  principal: string;

  @Prop({ required: true, default: 'Basic' })
  plan: string; // Basic, Standard, Premium, Enterprise

  @Prop({ required: true, default: 'Trial' })
  status: string; // Active, Trial, Expired, Suspended

  @Prop({ default: 0 })
  students: number;

  @Prop({ default: 0 })
  teachers: number;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  operator: string; // admin who created it

  @Prop({ default: Date.now })
  joined: Date;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
