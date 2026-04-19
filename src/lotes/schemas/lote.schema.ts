import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EstadoLote {
  ACTIVO = 'ACTIVO',
  RESERVADO = 'RESERVADO',
  COMPLETADO = 'COMPLETADO',
}

@Schema({ timestamps: true })
export class Lote extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop()
  descripcion: string;

  @Prop({ required: true })
  cantidad: string;

  @Prop({ required: true })
  peso_kg: number;

  @Prop({ required: true })
  categoria: string;

  @Prop({ default: EstadoLote.ACTIVO })
  estado: EstadoLote;

  @Prop()
  imagen_url: string;

  @Prop({ required: true })
  fecha_caducidad: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  donante_id: Types.ObjectId;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  ubicacion: {
    type: string;
    coordinates: [number, number];
  };

  @Prop({ default: false })
  esta_borrado: boolean;
}

export const LoteSchema = SchemaFactory.createForClass(Lote);

// Indice para búsquedas geoespaciales
LoteSchema.index({ ubicacion: '2dsphere' });
