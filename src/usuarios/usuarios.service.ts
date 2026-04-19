import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { SessionEntity } from './entities/session.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(SessionEntity) private sessionRepository: Repository<SessionEntity>,
  ) {}

  async create(userData: any): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new UserEntity();
    Object.assign(newUser, userData);
    newUser.password = hashedPassword;
    return await this.userRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateOtp(email: string, otp: string | null, expiresAt: Date | null): Promise<void> {
    await this.userRepository.update({ email }, { 
      otp_code: otp, 
      otp_expires_at: expiresAt 
    });
  }

  async updatePerfil(id: string, updateData: any): Promise<UserEntity | null> {
    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async saveSession(userId: string, email: string, ip: string, userAgent: string): Promise<void> {
    const newSession = this.sessionRepository.create({
      usuario_id: userId,
      email,
      ip,
      userAgent,
    });
    await this.sessionRepository.save(newSession);
  }

  async getSessions(): Promise<SessionEntity[]> {
    return this.sessionRepository.find({
      order: { createdAt: 'DESC' },
      take: 100
    });
  }
}
