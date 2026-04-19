import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lote, EstadoLote } from './schemas/lote.schema';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LotesService {
  constructor(
    @InjectModel(Lote.name) private loteModel: Model<Lote>,
    private configService: ConfigService,
  ) {}

  private fixImageUrl(url: string | null): string | null {
    if (!url) return url;
    const oldDomain = 'https://cdn.vooltlab.com';
    const minioEndpoint = this.configService.get<string>('MINIO_ENDPOINT');
    if (oldDomain && url.includes(oldDomain) && minioEndpoint) {
      return url.replace(oldDomain, minioEndpoint);
    }
    return url;
  }

  async getLotesActivos(): Promise<any[]> {
    const lotes = await this.loteModel
      .find({ estado: EstadoLote.ACTIVO, esta_borrado: { $ne: true } })
      .lean();
    
    return lotes.map(l => ({
      ...l,
      id: l._id,
      imagen_url: this.fixImageUrl(l.imagen_url),
    }));
  }

  async create(createLoteDto: CreateLoteDto, donanteId: string): Promise<Lote> {
    if (!donanteId || !Types.ObjectId.isValid(donanteId)) {
      throw new Error('ID de donante inválido o ausente');
    }

    const { latitud, longitud, ...rest } = createLoteDto;
    
    const nuevoLote = new this.loteModel({
      ...rest,
      donante_id: new Types.ObjectId(donanteId),
      ubicacion: {
        type: 'Point',
        coordinates: [longitud, latitud],
      },
      fecha_publicacion: new Date(),
      esta_borrado: false
    });

    return nuevoLote.save();
  }

  async findByDonante(donanteId: string): Promise<any[]> {
    try {
      if (!donanteId || !Types.ObjectId.isValid(donanteId)) {
        return [];
      }

      const query: any = { 
        donante_id: new Types.ObjectId(donanteId),
        esta_borrado: { $ne: true } 
      };
      
      const lotes = await this.loteModel.find(query).lean();

      return lotes.map(l => ({
        ...l,
        id: l._id,
        imagen_url: this.fixImageUrl(l.imagen_url),
      }));
    } catch (error) {
      console.error('Error en findByDonante:', error.message);
      return [];
    }
  }

  async update(id: string, updateLoteDto: UpdateLoteDto): Promise<Lote> {
    const { latitud, longitud, ...rest } = updateLoteDto;
    
    const updateData: any = { ...rest };
    if (latitud !== undefined && longitud !== undefined) {
      updateData.ubicacion = {
        type: 'Point',
        coordinates: [longitud, latitud],
      };
    }

    const actualizado = await this.loteModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!actualizado) {
      throw new NotFoundException('Lote no encontrado');
    }

    return actualizado;
  }

  async remove(id: string): Promise<boolean> {
    const actualizado = await this.loteModel
      .findByIdAndUpdate(id, { esta_borrado: true }, { new: true })
      .exec();
    
    return !!actualizado;
  }
}
