import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum EstadoReserva {
  PENDIENTE = 'PENDIENTE',
  RECOGIDO = 'RECOGIDO',
  COMPLETADO = 'COMPLETADO',
  VENCIDO = 'VENCIDO',
}

@Entity('reservas')
export class ReservaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lote_id: string; // ID de MongoDB

  @Column()
  receptor_id: string; // UUID de PostgreSQL

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    default: EstadoReserva.PENDIENTE,
  })
  estado: EstadoReserva;

  @Column({ unique: true })
  codigo_qr_token: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_reserva: Date;

  @Column({ type: 'timestamp' })
  fecha_limite_recogida: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_completada: Date;

  @CreateDateColumn()
  createdAt: Date;
}
