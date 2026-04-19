import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoteDto {
  @ApiProperty({ example: 'Pan de ayer' })
  @IsString()
  titulo: string;

  @ApiProperty({ example: 'Bolsa de 5 panes variados en buen estado' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: '5 unidades' })
  @IsString()
  cantidad: string;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  peso_kg: number;

  @ApiProperty({ example: 'Panadería' })
  @IsString()
  categoria: string;

  @ApiProperty({ example: '2025-12-31T23:59:59Z' })
  @IsDateString()
  fecha_caducidad: string;

  @ApiProperty({ example: 4.63819 })
  @IsNumber()
  latitud: number;

  @ApiProperty({ example: -74.08448 })
  @IsNumber()
  longitud: number;

  @ApiProperty({ example: 'https://ejemplo.com/lote.jpg' })
  @IsString()
  @IsOptional()
  imagen_url?: string;
}
