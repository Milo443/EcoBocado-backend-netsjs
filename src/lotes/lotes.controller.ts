import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LotesService } from './lotes.service';
import { StorageService } from '../common/storage/storage.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Lotes')
@Controller('lotes')
export class LotesController {
  constructor(
    private readonly lotesService: LotesService,
    private readonly storageService: StorageService,
  ) {}

  @Get('activos')
  @ApiOperation({
    summary: 'Listar lotes activos',
    description: 'Retorna todos los lotes de alimentos que están actualmente disponibles para reserva.',
  })
  async listarLotes() {
    return this.lotesService.getLotesActivos();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publicar nuevo lote',
    description: 'Permite a un donador publicar un nuevo lote de alimentos. Requiere rol DONOR.',
  })
  async publicarLote(@Body() lote: CreateLoteDto, @Request() req: any) {
    if (req.user.rol !== 'DONOR') {
      throw new ForbiddenException('Solo los donadores pueden publicar lotes');
    }
    return this.lotesService.create(lote, req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mis-lotes')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mis publicaciones',
    description: 'Retorna la lista de lotes publicados por el donador autenticado.',
  })
  async misLotes(@Request() req: any) {
    return this.lotesService.findByDonante(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':lote_id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar lote',
    description: 'Permite a un donador actualizar los datos de su lote.',
  })
  async actualizarLote(
    @Param('lote_id') loteId: string,
    @Body() loteUpdate: UpdateLoteDto,
    @Request() req: any,
  ) {
    // Nota: En producción validar que req.user.sub sea el dueño del lote
    return this.lotesService.update(loteId, loteUpdate);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':lote_id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar lote (Lógico)',
    description: 'Marca un lote como borrado.',
  })
  async eliminarLote(@Param('lote_id') loteId: string) {
    const exito = await this.lotesService.remove(loteId);
    if (!exito) {
      throw new NotFoundException('Lote no encontrado');
    }
    return { exito: true, mensaje: 'Lote eliminado correctamente' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Subir imagen de lote',
    description: 'Sube una imagen al servidor de almacenamiento y retorna su URL pública.',
  })
  async uploadLoteImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('No se ha proporcionado ninguna imagen');
    }
    const imageUrl = await this.storageService.uploadFile(file);
    return {
      imagen_url: imageUrl,
      mensaje: 'Imagen subida correctamente',
    };
  }
}
