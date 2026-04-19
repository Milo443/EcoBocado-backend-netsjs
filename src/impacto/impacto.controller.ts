import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ImpactoService } from './impacto.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Impacto')
@Controller('impacto')
export class ImpactoController {
  constructor(private readonly impactoService: ImpactoService) {}

  @Get('global')
  @ApiOperation({
    summary: 'Impacto Histórico Global',
    description: 'Retorna las métricas acumuladas de impacto social y ambiental de toda la plataforma.',
  })
  async impactoGlobal() {
    return this.impactoService.getGlobalImpact();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('dashboard-donante')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Métricas de Donante',
    description: 'Retorna las estadísticas personalizadas para el panel principal del donador.',
  })
  async dashboardDonante(@Request() req: any) {
    return this.impactoService.getDonorDashboard(req.user.sub);
  }
}
