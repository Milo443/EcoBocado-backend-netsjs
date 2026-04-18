import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsEnum, IsNotEmpty } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'EcoBocado Test', description: 'Nombre completo o del establecimiento' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'test@ecobocado.com', description: 'Correo electrónico' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Contraseña (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'DONOR', enum: ['DONOR', 'RECEPTOR'], description: 'Rol del usuario' })
  @IsEnum(['DONOR', 'RECEPTOR'])
  rol: string;

  @ApiProperty({ example: 'Calle 123 #45-67', description: 'Dirección física' })
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @ApiProperty({ example: '3001234567', description: 'Teléfono de contacto' })
  @IsString()
  @IsNotEmpty()
  telefono: string;
}
