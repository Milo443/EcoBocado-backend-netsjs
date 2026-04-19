import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model, Types } from 'mongoose';
import { Repository } from 'typeorm';
import { ReservaEntity, EstadoReserva } from './entities/reserva.entity';
import { Lote, EstadoLote } from '../lotes/schemas/lote.schema';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UserEntity } from '../usuarios/entities/user.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(ReservaEntity) private reservaRepository: Repository<ReservaEntity>,
    @InjectModel(Lote.name) private loteModel: Model<Lote>,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
  ) {}

  async crearReserva(createReservaDto: CreateReservaDto, receptorId: string): Promise<any> {
    const { lote_id } = createReservaDto;
    
    // 1. Verificar lote y disponibilidad (MongoDB)
    const lote = await this.loteModel.findById(lote_id);
    if (!lote || lote.estado !== EstadoLote.ACTIVO || lote.esta_borrado) {
      throw new BadRequestException('El lote no está disponible para reserva');
    }

    // 2. Verificar si ya existe una reserva PENDIENTE para este lote (PostgreSQL)
    const reservaExistente = await this.reservaRepository.findOne({
      where: {
        lote_id: lote_id,
        estado: EstadoReserva.PENDIENTE,
      },
    });
    if (reservaExistente) {
      throw new BadRequestException('El lote ya tiene una reserva pendiente');
    }

    // 3. Generar Token QR único
    const qrToken = `EB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // 4. Crear reserva (PostgreSQL)
    const nuevaReserva = this.reservaRepository.create({
      lote_id: lote_id,
      receptor_id: receptorId,
      estado: EstadoReserva.PENDIENTE,
      codigo_qr_token: qrToken,
      fecha_reserva: new Date(),
      fecha_limite_recogida: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
    });

    // 5. Actualizar estado del lote (MongoDB)
    lote.estado = EstadoLote.RESERVADO;
    await lote.save();

    await this.reservaRepository.save(nuevaReserva);

    return {
      ...nuevaReserva,
      lote_titulo: lote.titulo,
      lote_caduca: lote.fecha_caducidad,
    };
  }

  async findByUsuario(receptorId: string, estado?: EstadoReserva): Promise<any[]> {
    const query: any = { where: { receptor_id: receptorId } };
    if (estado) {
      query.where.estado = estado;
    }

    const reservas = await this.reservaRepository.find({
      ...query,
      order: { createdAt: 'DESC' }
    });

    const result: any[] = [];
    for (const res of reservas) {
      // Fetch lote details from MongoDB
      const lote = await this.loteModel.findById(res.lote_id).lean();
      let donanteNombre = 'Donante desconocido';
      let donanteDireccion = 'Dirección no disponible';

      if (lote && lote.donante_id) {
          // Fetch donante from PostgreSQL
          const donante = await this.userRepository.findOne({ where: { id: lote.donante_id.toString() } });
          if (donante) {
              donanteNombre = donante.nombre;
              donanteDireccion = donante.direccion;
          }
      }

      result.push({
        ...res,
        lote_titulo: lote?.titulo || 'Lote no disponible',
        lote_caduca: lote?.fecha_caducidad,
        donante_nombre: donanteNombre,
        donante_direccion: donanteDireccion,
      });
    }

    return result;
  }

  async completarReserva(reservaId: string): Promise<any> {
    const reserva = await this.reservaRepository.findOne({ where: { id: reservaId } });
    if (!reserva || reserva.estado !== EstadoReserva.PENDIENTE) {
      throw new BadRequestException('No se puede completar esta reserva');
    }

    reserva.estado = EstadoReserva.COMPLETADO;
    reserva.fecha_completada = new Date();
    await this.reservaRepository.save(reserva);

    // Actualizar lote (MongoDB)
    await this.loteModel.findByIdAndUpdate(reserva.lote_id, {
      estado: EstadoLote.COMPLETADO,
    });

    return reserva;
  }

  async cancelarReserva(reservaId: string): Promise<boolean> {
    const reserva = await this.reservaRepository.findOne({ where: { id: reservaId } });
    if (!reserva || reserva.estado !== EstadoReserva.PENDIENTE) {
      throw new BadRequestException('No se puede cancelar esta reserva');
    }

    reserva.estado = EstadoReserva.VENCIDO;
    await this.reservaRepository.save(reserva);

    // Liberar lote (MongoDB)
    await this.loteModel.findByIdAndUpdate(reserva.lote_id, {
      estado: EstadoLote.ACTIVO,
    });

    return true;
  }
}
