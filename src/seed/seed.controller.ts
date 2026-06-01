import { Controller, Get, Param, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed (Desarrollo)')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('force/:userId/:rol')
  @ApiOperation({
    summary: 'Poblar datos manualmente para un usuario',
    description: 'Genera lotes y reservas de demostración en PostgreSQL y MongoDB para un usuario y rol específicos.',
  })
  async forceSeedForUser(
    @Param('userId') userId: string,
    @Param('rol') rol: string,
  ) {
    try {
      if (rol.toUpperCase() === 'DONOR') {
        await this.seedService.seedForDonor(userId);
      } else if (rol.toUpperCase() === 'RECEPTOR') {
        await this.seedService.seedForReceptor(userId);
      } else {
        return { message: 'Rol inválido. Debe ser DONOR o RECEPTOR.' };
      }
      return { message: `Seeding manual exitoso para el usuario ${userId} con rol ${rol}` };
    } catch (error) {
      console.error('Error en forceSeedForUser:', error);
      throw new InternalServerErrorException(`Error en seeding manual: ${error.message}`);
    }
  }

  @Get('clear')
  @ApiOperation({
    summary: 'Limpiar bases de datos de pruebas',
    description: 'Elimina todos los lotes de MongoDB y reservas de PostgreSQL.',
  })
  async clear() {
    try {
      await this.seedService.clearDatabase();
      return { message: 'Limpieza de base de datos exitosa (lotes y reservas eliminados).' };
    } catch (error) {
      throw new InternalServerErrorException(`Error al limpiar: ${error.message}`);
    }
  }
}
