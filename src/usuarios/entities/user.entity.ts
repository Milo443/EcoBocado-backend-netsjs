import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RolUsuario {
  DONOR = 'DONOR',
  RECEPTOR = 'RECEPTOR',
}

@Entity('usuarios')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.RECEPTOR,
  })
  rol: RolUsuario;

  @Column({ nullable: true })
  direccion: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'varchar', nullable: true })
  otp_code: string | null;

  @Column({ type: 'timestamp', nullable: true })
  otp_expires_at: Date | null;

  @CreateDateColumn()
  fecha_registro: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
