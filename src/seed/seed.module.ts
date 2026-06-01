import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Lote, LoteSchema } from '../lotes/schemas/lote.schema';
import { UserEntity } from '../usuarios/entities/user.entity';
import { ReservaEntity } from '../reservas/entities/reserva.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lote.name, schema: LoteSchema }]),
    TypeOrmModule.forFeature([UserEntity, ReservaEntity]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
  exports: [SeedService],
})
export class SeedModule {}
