import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsNumber, Matches, IsBoolean } from 'class-validator';

export enum SchoolPlan {
  Basic = 'Basic',
  Standard = 'Standard',
  Premium = 'Premium',
  Enterprise = 'Enterprise',
}

export enum SchoolStatus {
  Trial = 'Trial',
  Active = 'Active',
  Suspended = 'Suspended',
  Expired = 'Expired',
}

export class CreateSchoolDto {
  @IsBoolean()
  @IsOptional()
  isCoaching?: boolean;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  principal: string;

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
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Phone number must be between 10 and 15 digits' })
  phone: string;

  @IsString()
  @IsOptional()
  operator?: string;

  @IsString()
  @IsOptional()
  themeColor?: string;

  @IsString()
  @IsOptional()
  adminName?: string;

  @IsEmail()
  @IsOptional()
  adminEmail?: string;

  @IsString()
  @IsOptional()
  adminPassword?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Admin phone number must be between 10 and 15 digits' })
  adminPhone?: string;
}
