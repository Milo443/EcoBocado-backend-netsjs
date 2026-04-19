import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote, EstadoLote } from '../lotes/schemas/lote.schema';
import { Reserva, EstadoReserva } from '../reservas/schemas/reserva.schema';
import { UserEntity, RolUsuario } from '../usuarios/entities/user.entity';
import { ReservaEntity } from '../reservas/entities/reserva.entity';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class ImpactoService {
  constructor(
    @InjectModel(Lote.name) private loteModel: Model<Lote>,
    @InjectModel(Reserva.name) private reservaModel: Model<Reserva>,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(ReservaEntity) private reservaRepository: Repository<ReservaEntity>,
    private usuariosService: UsuariosService,
  ) {}

  async getGlobalImpact(): Promise<any> {
    // 1. Total Rescatado (kg)
    const resultKg = await this.loteModel.aggregate([
      { $match: { estado: EstadoLote.COMPLETADO, esta_borrado: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$peso_kg' } } },
    ]);
    const total_kg = resultKg[0]?.total || 0;

    // 2. Personas Ayudadas (Receptores únicos con reservas completadas) - Desde PostgreSQL
    const personas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .select('DISTINCT(reserva.receptor_id)')
      .where('reserva.estado = :estado', { estado: 'COMPLETADO' })
      .getRawMany();

    // 3. Aliados Red (Donadores únicos) - Desde PostgreSQL
    const aliadosCount = await this.usuariosService.countByRol(RolUsuario.DONOR);

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
    // Peso rescatado por este donador
    const resultKg = await this.loteModel.aggregate([
      { $match: { donante_id: donorId, estado: EstadoLote.COMPLETADO } },
      { $group: { _id: null, total: { $sum: '$peso_kg' } } },
    ]);
    const peso_donador = resultKg[0]?.total || 0;

    // Lotes actualmente activos - Desde MongoDB
    const lotes_activos = await this.loteModel.countDocuments({
      donante_id: donorId,
      estado: EstadoLote.ACTIVO,
      esta_borrado: { $ne: true },
    });

    // Entregas hoy (completadas en las últimas 24h) - Desde PostgreSQL
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Contar reservas completadas hoy vinculando con lotes de este donante
    // Nota: Como los lotes están en Mongo, primero obtenemos los IDs de los lotes del donador
    const lotesDonante = await this.loteModel.find({ donante_id: donorId }, { _id: 1 }).lean();
    const loteIds = lotesDonante.map(l => l._id.toString());

    let entregas_hoy = 0;
    if (loteIds.length > 0) {
      entregas_hoy = await this.reservaRepository
        .createQueryBuilder('reserva')
        .where('reserva.lote_id IN (:...loteIds)', { loteIds })
        .andWhere('reserva.estado = :estado', { estado: 'COMPLETADO' })
        .andWhere('reserva.fecha_completada >= :hoy', { hoy })
        .getCount();
    }

    return {
      peso_rescatado_kg: Number(peso_donador.toFixed(2)),
      lotes_activos: lotes_activos,
      entregas_hoy: entregas_hoy,
    };
  }
}
