import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: true })
export class Activity {
  @Prop({ required: true })
  type: string; // school, user, payment, upgrade, support

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  color: string; // e.g. bg-blue-100 text-blue-600

  @Prop({ required: true, default: 'ALL' })
  schoolId: string;

  @Prop({ default: Date.now })
  time: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
