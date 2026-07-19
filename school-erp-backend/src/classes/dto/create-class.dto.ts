import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsString()
  roomNumber: string;

  @IsString()
  @IsOptional()
  teacherId?: string;

  @IsString()
  teacherName: string;

  @IsArray()
  @IsString({ each: true })
  subjects: string[];

  @IsString()
  @IsOptional()
  schoolId?: string;
}
