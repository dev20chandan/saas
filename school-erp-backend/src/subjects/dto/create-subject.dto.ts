import { IsString, IsOptional } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  className: string;

  @IsString()
  teacherName: string;

  @IsString()
  @IsOptional()
  schoolId?: string;
}
