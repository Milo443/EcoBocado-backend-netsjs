import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { ReservaEntity } from './entities/reserva.entity';
import { Lote, LoteSchema } from '../lotes/schemas/lote.schema';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { SeedModule } from '../seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservaEntity]),
    MongooseModule.forFeature([
      { name: Lote.name, schema: LoteSchema },
    ]),
    UsuariosModule,
    SeedModule,
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}
