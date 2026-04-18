import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: 'test@ecobocado.com', description: 'Correo electrónico para recibir el código' })
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'test@ecobocado.com', description: 'Correo electrónico' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Código de 6 dígitos recibido' })
  @IsString()
  @Length(6, 6)
  otp_code: string;
}
