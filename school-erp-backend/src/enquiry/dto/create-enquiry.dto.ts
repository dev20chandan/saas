import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateEnquiryDto {
  @IsString()
  studentName: string;

  @IsString()
  parentName: string;

  @IsString()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  course: string;

  @IsString()
  className: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  followUpDate?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  schoolId?: string;
}
