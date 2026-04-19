import { Controller, Get, Post, Put, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';

import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registro de un nuevo usuario' })
  async register(@Body() userData: RegisterUserDto) {
    const user = await this.usuariosService.create(userData);
    return {
      message: 'Usuario registrado con éxito',
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('perfil')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async getPerfil(@Request() req: any) {
    const user = await this.usuariosService.findById(req.user.id);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      direccion: user.direccion,
      telefono: user.telefono,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('perfil')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  async updatePerfil(@Request() req: any, @Body() updateData: UpdateProfileDto) {
    return this.usuariosService.updatePerfil(req.user.id, updateData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sesiones')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar auditoría de sesiones (historial de accesos)' })
  async getSesiones() {
    return this.usuariosService.getSessions();
  }
}
