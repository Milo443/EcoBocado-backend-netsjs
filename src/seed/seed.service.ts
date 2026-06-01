import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote, EstadoLote } from '../lotes/schemas/lote.schema';
import { UserEntity, RolUsuario } from '../usuarios/entities/user.entity';
import { ReservaEntity, EstadoReserva } from '../reservas/entities/reserva.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(Lote.name) private loteModel: Model<Lote>,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(ReservaEntity) private reservaRepository: Repository<ReservaEntity>,
  ) {}

  async onModuleInit() {
    console.log('[SeedService] Inicializando Auto-Seeding...');
    try {
      const userCount = await this.userRepository.count();
      if (userCount === 0) {
        console.log('[SeedService] Base de datos de usuarios vacía. Creando usuarios demo...');
        await this.seedInitialUsers();
      } else {
        console.log('[SeedService] Ya existen usuarios en la base de datos.');
      }
    } catch (err) {
      console.error('[SeedService] Error durante onModuleInit:', err);
    }
  }

  private async seedInitialUsers() {
    const donorPass = await bcrypt.hash('password123', 10);
    const receptorPass = await bcrypt.hash('password123', 10);

    // 1. Crear Donador Demo
    const donor = this.userRepository.create({
      nombre: 'Supermercado EcoBocado',
      email: 'donante@ecobocado.com',
      password: donorPass,
      rol: RolUsuario.DONOR,
      direccion: 'Calle 5 # 34-22, Cali',
      latitud: 3.4215,
      longitud: -76.5161,
      telefono: '3157778899',
      avatar_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200',
    });
    const savedDonor = await this.userRepository.save(donor);

    // 2. Crear Receptor Demo
    const receptor = this.userRepository.create({
      nombre: 'Fundación Manos Abiertas',
      email: 'receptor@ecobocado.com',
      password: receptorPass,
      rol: RolUsuario.RECEPTOR,
      direccion: 'Avenida 4N # 12-55, Cali',
      latitud: 3.4516,
      longitud: -76.5320,
      telefono: '3104445566',
      avatar_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=200',
    });
    const savedReceptor = await this.userRepository.save(receptor);

    console.log('[SeedService] Usuarios iniciales demo creados con éxito.');
    
    // Auto-poblar datos para ellos
    await this.seedForDonor(savedDonor.id);
    await this.seedForReceptor(savedReceptor.id);
  }

  async seedForDonor(donorId: string) {
    console.log('[SeedService] Poblando datos demo para donador:', donorId);
    
    // Buscar un receptor para asignar las reservas de este donador
    let receptor = await this.userRepository.findOne({ where: { rol: RolUsuario.RECEPTOR } });
    if (!receptor) {
      // Crear uno rápido si no hay ninguno
      const pass = await bcrypt.hash('password123', 10);
      receptor = await this.userRepository.save(
        this.userRepository.create({
          nombre: 'Alianza Solidaria Cali',
          email: 'alianza.cali@test.com',
          password: pass,
          rol: RolUsuario.RECEPTOR,
          direccion: 'Avenida Sexta, Cali',
          latitud: 3.46,
          longitud: -76.53,
          telefono: '3120001122',
        })
      );
    }

    const receptorId = receptor.id;

    // Categorías y textos descriptivos
    const mockLotes = [
      {
        titulo: 'Caja de Manzanas y Bananos',
        descripcion: 'Frutas frescas y maduras listas para consumo inmediato. Perfectas para jugos o postres.',
        cantidad: '15 Kg',
        peso_kg: 15.0,
        categoria: 'FRUTAS',
        estado: EstadoLote.ACTIVO,
      },
      {
        titulo: 'Lote de Yogures y Queso Blanco',
        descripcion: 'Yogures enteros con fecha de vencimiento próxima (2 días). Refrigerados adecuadamente.',
        cantidad: '24 Unidades',
        peso_kg: 8.5,
        categoria: 'LACTEOS',
        estado: EstadoLote.ACTIVO,
      },
      {
        titulo: 'Bolsas de Panes Variados y Cruasanes',
        descripcion: 'Panes recién horneados del día anterior. Empacados individualmente en bolsas de papel.',
        cantidad: '30 Piezas',
        peso_kg: 10.0,
        categoria: 'PANADERIA',
        estado: EstadoLote.RESERVADO,
      },
      {
        titulo: 'Canasta de Verduras Surtidas',
        descripcion: 'Lechugas, tomates y zanahorias de temporada. Buen estado, excedentes de inventario.',
        cantidad: '20 Kg',
        peso_kg: 20.0,
        categoria: 'VEGETALES',
        estado: EstadoLote.COMPLETADO,
        mesOffset: 0,
      },
      {
        titulo: 'Excedente de Pan de Bono y Buñuelos',
        descripcion: 'Alimentos típicos colombianos horneados por exceso de producción. Deliciosos.',
        cantidad: '40 Unidades',
        peso_kg: 6.0,
        categoria: 'PANADERIA',
        estado: EstadoLote.COMPLETADO,
        mesOffset: -1,
      },
      {
        titulo: 'Cajas de Leche Entera (Alquería)',
        descripcion: 'Cajas cerradas de leche de 1 litro cada una. En perfecto estado y con empaque original.',
        cantidad: '12 Litros',
        peso_kg: 12.0,
        categoria: 'LACTEOS',
        estado: EstadoLote.COMPLETADO,
        mesOffset: -2,
      },
      {
        titulo: 'Bolsas de Naranjas para Jugo',
        descripcion: 'Naranjas dulces perfectas para desayuno escolar o comedor comunitario.',
        cantidad: '25 Kg',
        peso_kg: 25.0,
        categoria: 'FRUTAS',
        estado: EstadoLote.COMPLETADO,
        mesOffset: -3,
      },
      {
        titulo: 'Sacos de Papa Común y Criolla',
        descripcion: 'Papas lavadas de excelente calidad y tamaño variado.',
        cantidad: '50 Kg',
        peso_kg: 50.0,
        categoria: 'VEGETALES',
        estado: EstadoLote.COMPLETADO,
        mesOffset: -4,
      }
    ];

    const imagenesCategorias = {
      FRUTAS: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?q=80&w=500',
      LACTEOS: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=500',
      PANADERIA: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500',
      VEGETALES: 'https://images.unsplash.com/photo-1566385101042-1a010d420f1f?q=80&w=500',
      OTROS: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500'
    };

    for (const item of mockLotes) {
      const fechaCaducidad = new Date();
      fechaCaducidad.setDate(fechaCaducidad.getDate() + 3);

      const loteData = {
        titulo: item.titulo,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        peso_kg: item.peso_kg,
        categoria: item.categoria,
        estado: item.estado,
        donante_id: donorId,
        fecha_caducidad: fechaCaducidad,
        esta_borrado: false,
        imagen_url: imagenesCategorias[item.categoria] || imagenesCategorias.OTROS,
        ubicacion: {
          type: 'Point',
          coordinates: [-76.5161 + (Math.random() - 0.5) * 0.02, 3.4215 + (Math.random() - 0.5) * 0.02],
        },
      };

      const newLote = new this.loteModel(loteData);
      const savedLote = await newLote.save();

      // Si el estado no es ACTIVO, crear la reserva correspondiente
      if (item.estado === EstadoLote.RESERVADO) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + 1);

        const newReserva = this.reservaRepository.create({
          lote_id: savedLote._id.toString(),
          receptor_id: receptorId,
          estado: EstadoReserva.PENDIENTE,
          codigo_qr_token: `reserva_${savedLote._id.toString()}_${Math.floor(1000 + Math.random() * 9000)}`,
          fecha_reserva: new Date(),
          fecha_limite_recogida: fechaLimite,
        });
        await this.reservaRepository.save(newReserva);
      } else if (item.estado === EstadoLote.COMPLETADO) {
        const fechaCompletada = new Date();
        const offset = (item as any).mesOffset ?? 0;
        fechaCompletada.setMonth(fechaCompletada.getMonth() + offset);

        const newReserva = this.reservaRepository.create({
          lote_id: savedLote._id.toString(),
          receptor_id: receptorId,
          estado: EstadoReserva.COMPLETADO,
          codigo_qr_token: `reserva_comp_${savedLote._id.toString()}`,
          fecha_reserva: new Date(fechaCompletada.getTime() - 2 * 3600 * 1000),
          fecha_limite_recogida: new Date(fechaCompletada.getTime() + 24 * 3600 * 1000),
          fecha_completada: fechaCompletada,
        });
        await this.reservaRepository.save(newReserva);
      }
    }

    console.log(`[SeedService] Auto-seeding JIT para Donador (${donorId}) completado con éxito.`);
  }

  async seedForReceptor(receptorId: string) {
    console.log('[SeedService] Poblando datos demo para receptor:', receptorId);

    // Buscar un donador para asignarle la procedencia de los lotes de este receptor
    let donor = await this.userRepository.findOne({ where: { rol: RolUsuario.DONOR } });
    if (!donor) {
      const pass = await bcrypt.hash('password123', 10);
      donor = await this.userRepository.save(
        this.userRepository.create({
          nombre: 'Restaurante Sabor Verde',
          email: 'sabor.verde@test.com',
          password: pass,
          rol: RolUsuario.DONOR,
          direccion: 'Calle 9, Cali',
          latitud: 3.43,
          longitud: -76.52,
          telefono: '3151112233',
        })
      );
    }

    const donorId = donor.id;

    // Crear lotes ajenos para que el receptor los tenga reservados o completados
    const receptorLotes = [
      {
        titulo: '20 Bandejas de Almuerzo Casero',
        descripcion: 'Arroz, frijoles, proteína y ensalada. Preparado hoy mismo, no se vendió y está empacado en contenedores biodegradables.',
        cantidad: '20 Porciones',
        peso_kg: 10.0,
        categoria: 'OTROS',
        estado: EstadoLote.RESERVADO,
      },
      {
        titulo: 'Lote de Panes y Ponqués Dulces',
        descripcion: 'Rollos de canela y porciones de torta de chocolate. Aptos para consumo.',
        cantidad: '18 Porciones',
        peso_kg: 5.4,
        categoria: 'PANADERIA',
        estado: EstadoLote.COMPLETADO,
      }
    ];

    const imagenesCategorias = {
      PANADERIA: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500',
      OTROS: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500'
    };

    for (const item of receptorLotes) {
      const fechaCaducidad = new Date();
      fechaCaducidad.setDate(fechaCaducidad.getDate() + 2);

      const loteData = {
        titulo: item.titulo,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        peso_kg: item.peso_kg,
        categoria: item.categoria,
        estado: item.estado,
        donante_id: donorId,
        fecha_caducidad: fechaCaducidad,
        esta_borrado: false,
        imagen_url: imagenesCategorias[item.categoria] || imagenesCategorias.OTROS,
        ubicacion: {
          type: 'Point',
          coordinates: [-76.5320 + (Math.random() - 0.5) * 0.015, 3.4516 + (Math.random() - 0.5) * 0.015],
        },
      };

      const newLote = new this.loteModel(loteData);
      const savedLote = await newLote.save();

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 1);

      if (item.estado === EstadoLote.RESERVADO) {
        const newReserva = this.reservaRepository.create({
          lote_id: savedLote._id.toString(),
          receptor_id: receptorId,
          estado: EstadoReserva.PENDIENTE,
          codigo_qr_token: `reserva_${savedLote._id.toString()}_${Math.floor(1000 + Math.random() * 9000)}`,
          fecha_reserva: new Date(),
          fecha_limite_recogida: fechaLimite,
        });
        await this.reservaRepository.save(newReserva);
      } else if (item.estado === EstadoLote.COMPLETADO) {
        const newReserva = this.reservaRepository.create({
          lote_id: savedLote._id.toString(),
          receptor_id: receptorId,
          estado: EstadoReserva.COMPLETADO,
          codigo_qr_token: `reserva_comp_${savedLote._id.toString()}`,
          fecha_reserva: new Date(Date.now() - 48 * 3600 * 1000),
          fecha_limite_recogida: new Date(Date.now() - 24 * 3600 * 1000),
          fecha_completada: new Date(Date.now() - 25 * 3600 * 1000),
        });
        await this.reservaRepository.save(newReserva);
      }
    }

    console.log(`[SeedService] Auto-seeding JIT para Receptor (${receptorId}) completado con éxito.`);
  }

  async clearDatabase() {
    console.log('[SeedService] Limpiando base de datos...');
    await this.loteModel.deleteMany({});
    await this.reservaRepository.delete({});
    console.log('[SeedService] Limpieza completada.');
  }
}
