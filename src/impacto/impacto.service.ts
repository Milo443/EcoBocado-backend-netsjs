import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lote, EstadoLote } from '../lotes/schemas/lote.schema';
import { Reserva, EstadoReserva } from '../reservas/schemas/reserva.schema';
import { User } from '../usuarios/schemas/user.schema';

@Injectable()
export class ImpactoService {
  constructor(
    @InjectModel(Lote.name) private loteModel: Model<Lote>,
    @InjectModel(Reserva.name) private reservaModel: Model<Reserva>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getGlobalImpact(): Promise<any> {
    // 1. Total Rescatado (kg)
    const resultKg = await this.loteModel.aggregate([
      { $match: { estado: EstadoLote.COMPLETADO, esta_borrado: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$peso_kg' } } },
    ]);
    const total_kg = resultKg[0]?.total || 0;

    // 2. Personas Ayudadas (Receptores únicos con reservas completadas)
    const personas = await this.reservaModel.distinct('receptor_id', {
      estado: EstadoReserva.COMPLETADO,
    });

    // 3. Aliados Red (Donadores únicos)
    const aliadosCount = await this.userModel.countDocuments({ rol: 'DONOR' });

    // 4. CO2 Mitigado (Factor: 2.5kg CO2 por cada 1kg de comida)
    const co2 = Number((total_kg * 2.5).toFixed(2));

    // 5. Impacto por categoría
    const impactoCategorias = await this.loteModel.aggregate([
      { $match: { estado: EstadoLote.COMPLETADO, esta_borrado: { $ne: true } } },
      { $group: { _id: '$categoria', total: { $sum: '$peso_kg' } } },
    ]);

    const impacto_por_categoria = {};
    impactoCategorias.forEach(item => {
      impacto_por_categoria[item._id] = Number(item.total.toFixed(2));
    });

    return {
      total_rescatado_kg: Number(total_kg.toFixed(2)),
      personas_ayudadas: personas.length,
      aliados_red: aliadosCount,
      co2_mitigado_kg: co2,
      impacto_por_categoria,
      impacto_mensual: [], // Simplificado por ahora
    };
  }

  async getDonorDashboard(donorId: string): Promise<any> {
    const donorObjectId = new Types.ObjectId(donorId);

    // Peso rescatado por este donador
    const resultKg = await this.loteModel.aggregate([
      { $match: { donante_id: donorObjectId, estado: EstadoLote.COMPLETADO } },
      { $group: { _id: null, total: { $sum: '$peso_kg' } } },
    ]);
    const peso_donador = resultKg[0]?.total || 0;

    // Lotes actualmente activos
    const lotes_activos = await this.loteModel.countDocuments({
      donante_id: donorObjectId,
      estado: EstadoLote.ACTIVO,
      esta_borrado: { $ne: true },
    });

    // Entregas hoy (completadas en las últimas 24h)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entregas_hoy = await this.reservaModel.countDocuments({
      estado: EstadoReserva.COMPLETADO,
      fecha_completada: { $gte: hoy },
    }).populate({
      path: 'lote_id',
      match: { donante_id: donorObjectId }
    });
    
    // Nota: El count con populate match requiere cuidado en NoSQL. 
    // Opción B: Agregación.
    const entregasHoyAggregate = await this.reservaModel.aggregate([
      { $match: { estado: EstadoReserva.COMPLETADO, fecha_completada: { $gte: hoy } } },
      {
        $lookup: {
          from: 'lotes',
          localField: 'lote_id',
          foreignField: '_id',
          as: 'lote',
        },
      },
      { $unwind: '$lote' },
      { $match: { 'lote.donante_id': donorObjectId } },
      { $count: 'total' },
    ]);

    return {
      peso_rescatado_kg: Number(peso_donador.toFixed(2)),
      lotes_activos: lotes_activos,
      entregas_hoy: entregasHoyAggregate[0]?.total || 0,
    };
  }
}
