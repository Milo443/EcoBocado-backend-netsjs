import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EstadoReserva {
  PENDIENTE = 'PENDIENTE',
  RECOGIDO = 'RECOGIDO',
  COMPLETADO = 'COMPLETADO',
  VENCIDO = 'VENCIDO',
}

@Schema({ timestamps: true })
export class Reserva extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Lote', required: true })
  lote_id: Types.ObjectId;

  @Prop({ required: true })
  receptor_id: string;

  @Prop({ default: EstadoReserva.PENDIENTE })
  estado: EstadoReserva;

  @Prop({ required: true, unique: true })
  codigo_qr_token: string;

  @Prop()
  fecha_reserva: Date;

  @Prop({ required: true })
  fecha_limite_recogida: Date;

  @Prop()
  fecha_completada: Date;
}

export const ReservaSchema = SchemaFactory.createForClass(Reserva);
