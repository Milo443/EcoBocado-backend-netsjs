import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImpactoController } from './impacto.controller';
import { ImpactoService } from './impacto.service';
import { Lote, LoteSchema } from '../lotes/schemas/lote.schema';
import { Reserva, ReservaSchema } from '../reservas/schemas/reserva.schema';
import { User, UserSchema } from '../usuarios/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lote.name, schema: LoteSchema },
      { name: Reserva.name, schema: ReservaSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ImpactoController],
  providers: [ImpactoService],
})
export class ImpactoModule {}
