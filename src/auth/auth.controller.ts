import { Controller, Get, Post, Body, Ip, Headers, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequestOtpDto, VerifyOtpDto } from './dto/login-otp.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@ApiTags('usuarios')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Iniciar sesión con Google OAuth 2.0' })
  async googleAuth() {
    // La guardia redirige automáticamente a Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback de Google OAuth 2.0' })
  async googleCallback(@Req() req: any, @Res() res: any) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const email = req.user.email;
    
    const userExists = await this.authService.checkUserExists(email);
    
    if (userExists) {
      // El usuario existe, iniciamos sesión normalmente
      const user = await this.authService.validateOrCreateUser(req.user);
      const tokenData = await this.authService.generateToken(user);
      res.redirect(`${frontendUrl}/login?token=${tokenData.access_token}`);
    } else {
      // El usuario no existe, lo enviamos a registrarse con sus datos precargados
      const nombre = encodeURIComponent(req.user.nombre || '');
      const emailEncoded = encodeURIComponent(email);
      const avatarUrl = encodeURIComponent(req.user.avatar_url || '');
      
      res.redirect(`${frontendUrl}/register?oauth=true&email=${emailEncoded}&nombre=${nombre}&avatar_url=${avatarUrl}`);
    }
  }
}
