import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el estado actual del servidor' })
  getStatus() {
    return this.statusService.getStatus();
  }
}
