import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { AuthGuard } from '@nestjs/passport';
import { EstadoReserva } from './schemas/reserva.schema';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Reservas')
@Controller('reservas')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @ApiOperation({
    summary: 'Reservar un lote',
    description: 'Crea una reserva para un lote de comida. Cambia el estado del lote a RESERVADO.',
  })
  async reservarLote(@Body() createDto: CreateReservaDto, @Request() req: any) {
    return this.reservasService.crearReserva(createDto, req.user.sub);
  }

  @Get('activas')
  @ApiOperation({
    summary: 'Mis reservas activas',
    description: 'Retorna la lista de reservas en estado PENDIENTE del usuario autenticado.',
  })
  async reservasActivas(@Request() req: any) {
    return this.reservasService.findByUsuario(req.user.sub, EstadoReserva.PENDIENTE);
  }

  @Get('historial')
  @ApiOperation({
    summary: 'Historial de reservas',
    description: 'Retorna el historial de reservas (Completas, Vencidas, etc.) del usuario.',
  })
  async reservasHistorial(@Request() req: any) {
    // Retorna todo lo que no sea PENDIENTE (o todo el historial)
    // En FastAPI filtraban manualmente, aquí podemos retornar todo o filtrar
    return this.reservasService.findByUsuario(req.user.sub);
  }

  @Post(':reserva_id/completar')
  @ApiOperation({
    summary: 'Completar recogida',
    description: 'Marca una reserva como completada y el lote como entregado.',
  })
  async completarRecogida(@Param('reserva_id') reservaId: string) {
    return this.reservasService.completarReserva(reservaId);
  }

  @Post(':reserva_id/cancelar')
  @ApiOperation({
    summary: 'Cancelar reserva',
    description: 'Libera el lote y marca la reserva como vencida/cancelada.',
  })
  async cancelarReserva(@Param('reserva_id') reservaId: string) {
    const exito = await this.reservasService.cancelarReserva(reservaId);
    return { exito, mensaje: 'Reserva cancelada exitosamente' };
  }
}
