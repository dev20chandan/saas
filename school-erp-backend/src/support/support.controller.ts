import { Controller, Get } from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  findAll() {
    return this.supportService.findAll();
  }
}
