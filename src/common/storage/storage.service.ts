import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT') || 'http://localhost:9000';
    const accessKeyId = this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin';
    const secretAccessKey = this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin';
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 'ecobocado-images';

    this.s3Client = new S3Client({
      endpoint: endpoint,
      forcePathStyle: true,
      region: 'us-east-1',
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read', // Depende de la configuración de MinIO
        }),
      );

      const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
      // Construir la URL final basándose en el endpoint y el bucket
      return `${endpoint}/${this.bucketName}/${fileName}`;
    } catch (error) {
      this.logger.error(`Error subiendo archivo a MinIO: ${error.message}`);
      throw new Error('No se pudo subir la imagen al servidor de almacenamiento.');
    }
  }
}
