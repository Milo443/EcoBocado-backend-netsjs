import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nuevo Nombre', description: 'Nombre completo actualizado' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Nueva Dirección 123', description: 'Dirección actualizada' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ example: '3119876543', description: 'Teléfono de contacto actualizado' })
  @IsString()
  @IsOptional()
  telefono?: string;
}
