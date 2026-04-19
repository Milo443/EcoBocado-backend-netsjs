import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LotesController } from './lotes.controller';
import { LotesService } from './lotes.service';
import { Lote, LoteSchema } from './schemas/lote.schema';
import { StorageModule } from '../common/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lote.name, schema: LoteSchema }]),
    StorageModule,
  ],
  controllers: [LotesController],
  providers: [LotesService],
  exports: [LotesService],
})
export class LotesModule {}
