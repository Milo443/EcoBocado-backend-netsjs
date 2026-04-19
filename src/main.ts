import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Registrar filtros de excepción globales
  app.useGlobalFilters(new MongoExceptionFilter());
  
  // Habilitar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Habilitar CORS para desarrollo
  app.enableCors();

  // Establecer prefijo global para la API
  app.setGlobalPrefix('api/v1');
  
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('EcoBocado API')
    .setDescription('Documentación de la API para el proyecto EcoBocado Backend')
    .setVersion('1.0')
    .addTag('usuarios')
    .addTag('status')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Exponer el JSON de Swagger para ReDoc
  app.getHttpAdapter().get('/api-json', (req, res) => {
    res.json(document);
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 API EcoBocado corriendo en: http://localhost:${port}`);
  console.log(`Endpoint de estado: http://localhost:${port}/status`);
  console.log(`Documentación Swagger: http://localhost:${port}/api`);
}
bootstrap();
