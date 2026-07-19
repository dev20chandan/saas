import { IsString, IsOptional } from 'class-validator';

export class CreateTimetableDto {
  @IsString()
  className: string;

  @IsString()
  dayOfWeek: string;

  @IsString()
  subjectName: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  teacherName: string;

  @IsString()
  roomNumber: string;

  @IsString()
  @IsOptional()
  schoolId?: string;
}
