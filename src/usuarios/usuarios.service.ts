import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Session, SessionDocument } from './schemas/session.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async create(userData: any): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateOtp(email: string, otp: string | null, expiresAt: Date | null): Promise<void> {
    await this.userModel.updateOne(
      { email },
      { 
        otp_code: otp, 
        otp_expires_at: expiresAt 
      }
    ).exec();
  }

  async updatePerfil(id: string, updateData: any): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async saveSession(userId: string, email: string, ip: string, userAgent: string): Promise<void> {
    const newSession = new this.sessionModel({
      userId,
      email,
      ip,
      userAgent,
    });
    await newSession.save();
  }

  async getSessions(): Promise<SessionDocument[]> {
    return this.sessionModel.find().sort({ createdAt: -1 }).limit(100).exec();
  }
}
