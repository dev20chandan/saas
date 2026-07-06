import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: 'Teacher' })
  role: string; // System Admin, School Admin, Teacher, Staff, Parent

  @Prop({ required: true, default: 'ALL' })
  schoolId: string; // "ALL" or specific school ObjectId/code

  @Prop({ default: 'All Schools' })
  school: string; // Cached display name of the school

  @Prop()
  operator: string; // Who added this user

  @Prop({ required: true, default: 'Active' })
  status: string; // Active, Inactive, Locked, Pending

  @Prop()
  phone: string;

  @Prop()
  lastLogin: Date;

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);
