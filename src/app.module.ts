import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatusModule } from './status/status.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { LotesModule } from './lotes/lotes.module';
import { ReservasModule } from './reservas/reservas.module';
import { ImpactoModule } from './impacto/impacto.module';
import { AuthModule } from './auth/auth.module';
import { DocsController } from './common/controllers/docs.controller';

@Module({
  imports: [
    // Carga las variables de entorno del archivo .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a MongoDB usando la URI del archivo .env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Conexión a PostgreSQL usando TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Nota: En producción esto debería ser false
      }),
      inject: [ConfigService],
    }),

    StatusModule,

    UsuariosModule,

    AuthModule,
    LotesModule,
    ReservasModule,
    ImpactoModule,
  ],
  controllers: [DocsController],
})
export class AppModule {}
