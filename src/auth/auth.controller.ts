import { Controller, Post, Body, Ip, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequestOtpDto, VerifyOtpDto } from './dto/login-otp.dto';

@ApiTags('usuarios')
@Controller('usuarios')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login-otp/request')
  @ApiOperation({ summary: 'Solicitar un código OTP' })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.email);
  }

  @Post('login-otp/verify')
  @ApiOperation({ summary: 'Verificar OTP y obtener token' })
  verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.verifyOtp(dto.email, dto.otp_code, ip, userAgent);
  }
}
