import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll() {
    return this.auditService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.auditService.create(data);
  }
}
