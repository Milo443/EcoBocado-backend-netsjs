import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtpEmail(to_email: string, otp_code: string): Promise<boolean> {
    const serviceId = this.configService.get<string>('EMAILJS_SERVICE_ID');
    const templateId = this.configService.get<string>('EMAILJS_TEMPLATE_ID');
    const publicKey = this.configService.get<string>('EMAILJS_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('EMAILJS_PRIVATE_KEY');

    if (!serviceId || !templateId || !publicKey) {
      this.logger.warn('EmailJS credentials not configured. OTP will be printed to console.');
      console.log('------------------------------------------------');
      console.log(`🔑 DEBUG OTP for ${to_email}: ${otp_code}`);
      console.log('------------------------------------------------');
      return true;
    }

    const url = 'https://api.emailjs.com/api/v1.0/email/send';
    
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: to_email,
        email: to_email,
        otp_code: otp_code,
      },
      accessToken: privateKey, // Necesario si se usa la API REST
    };

    try {
      await firstValueFrom(this.httpService.post(url, payload));
      this.logger.log(`Email enviado con éxito a ${to_email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email via EmailJS: ${error.message}`);
      if (error.response) {
        this.logger.error(`Detalle de respuesta: ${JSON.stringify(error.response.data)}`);
      }
      return false;
    }
  }
}
