import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { EmailService } from '../common/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async requestOtp(email: string) {
    const user = await this.usuariosService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Generar código de 6 dígitos
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await this.usuariosService.updateOtp(email, otp, expiresAt);

    // Enviar correo real (con fallback a consola)
    await this.emailService.sendOtpEmail(email, otp);

    return { message: 'Código enviado con éxito' };
  }

  async verifyOtp(email: string, otpCode: string, ip?: string, userAgent?: string) {
    const user = await this.usuariosService.findByEmail(email);

    if (!user || user.otp_code !== otpCode || new Date() > (user.otp_expires_at ?? new Date(0))) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    // Limpiar OTP después de verificar
    await this.usuariosService.updateOtp(email, null, null);

    // Registrar auditoría de sesión
    if (ip && userAgent) {
      await this.usuariosService.saveSession(user.id, user.email, ip, userAgent);
    }

    const payload = { sub: user.id, email: user.email, rol: user.rol };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        direccion: user.direccion,
        telefono: user.telefono,
      },
    };
  }
}
