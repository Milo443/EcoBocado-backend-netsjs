import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImpactoController } from './impacto.controller';
import { ImpactoService } from './impacto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote, LoteSchema } from '../lotes/schemas/lote.schema';
import { Reserva, ReservaSchema } from '../reservas/schemas/reserva.schema';
import { UserEntity } from '../usuarios/entities/user.entity';
import { ReservaEntity } from '../reservas/entities/reserva.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lote.name, schema: LoteSchema },
    ]),
    TypeOrmModule.forFeature([UserEntity, ReservaEntity]),
    UsuariosModule,
  ],
  controllers: [ImpactoController],
  providers: [ImpactoService],
})
export class ImpactoModule {}
