import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true, enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT'] })
  action: string;

  @Prop({ required: true })
  resource: string;

  @Prop({ required: true, enum: ['Success', 'Failure'] })
  status: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ type: Object })
  payload: any;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
