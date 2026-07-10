import { IsString, IsOptional, IsEmail, IsNumber, IsEnum, Matches } from 'class-validator';
import { SchoolPlan, SchoolStatus } from './create-school.dto';

export class UpdateSchoolDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  principal?: string;

  @IsEnum(SchoolPlan)
  @IsOptional()
  plan?: SchoolPlan;

  @IsEnum(SchoolStatus)
  @IsOptional()
  status?: SchoolStatus;

  @IsNumber()
  @IsOptional()
  students?: number;

  @IsNumber()
  @IsOptional()
  teachers?: number;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Phone number must be between 10 and 15 digits' })
  phone?: string;

  @IsString()
  @IsOptional()
  operator?: string;
}
