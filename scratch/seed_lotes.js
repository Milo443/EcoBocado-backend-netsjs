const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

// Cargar variables de entorno del backend NestJS
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = 'mongodb+srv://api_ecobocado:ecobocado2026@cluster0.algyowl.mongodb.net/EcoBocado';
const DONANTE_ID = '69e4173c1a66e4b8491721ed';
const IMAGES_DIR = 'C:/Users/calde/OneDrive/Pictures/food';

const s3Client = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
    forcePathStyle: true,
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
});

const IMAGES_MAPPING = [
    { file: 'manzana.jpg', titulo: 'Manzanas Frescas', cat: 'FRUTAS', desc: 'Lote de manzanas rojas, frescas y listas para consumo inmediato.', cant: '2kg', peso: 2 },
    { file: 'zanahoria.jpg', titulo: 'Zanahorias de Huerto', cat: 'VEGETALES', desc: 'Zanahorias orgánicas, recién cosechadas.', cant: '3kg', peso: 3 },
    { file: 'latas-de-atun.webp', titulo: 'Pack de Atún', cat: 'OTROS', desc: '6 latas de atún en aceite, fecha de vencimiento próxima.', cant: '6 latas', peso: 1.2 },
    { file: 'queso.avif', titulo: 'Queso Campesino', cat: 'LACTEOS', desc: 'Queso fresco artesanal, bloque de 500g.', cant: '2 unidades', peso: 1 },
    { file: 'bulto-arroz.jpg', titulo: 'Bulto de Arroz 10kg', cat: 'OTROS', desc: 'Arroz blanco de grano largo, bulto sellado.', cant: '1 bulto', peso: 10 },
    { file: 'tortas-pronto-consumo.webp', titulo: 'Tortas de Pronto Consumo', cat: 'PANADERIA', desc: 'Variedad de tortas y bizcochos del día.', cant: '5 unidades', peso: 2.5 },
    { file: 'images (1).jpg', titulo: 'Pan de la Casa', cat: 'PANADERIA', desc: 'Bolsas de pan artesanal variado.', cant: '4 bolsas', peso: 1.5 }
];

async function seed() {
    try {
        console.log('Conectando a MongoDB...');
        await mongoose.connect(MONGO_URI);
        const Lote = mongoose.connection.db.collection('lotes');

        console.log('Iniciando carga de publicaciones...');

        for (const item of IMAGES_MAPPING) {
            const filePath = path.join(IMAGES_DIR, item.file);
            if (!fs.existsSync(filePath)) {
                console.warn(`Archivo no encontrado: ${filePath}`);
                continue;
            }

            const fileBuffer = fs.readFileSync(filePath);
            const fileExt = path.extname(item.file);
            const fileName = `${uuidv4()}${fileExt}`;

            console.log(`Subiendo imagen: ${item.file}...`);
            await s3Client.send(new PutObjectCommand({
                Bucket: process.env.MINIO_BUCKET_NAME || 'ecobocado-images',
                Key: fileName,
                Body: fileBuffer,
                ACL: 'public-read',
                ContentType: `image/${fileExt.replace('.', '')}`
            }));

            const imageUrl = `${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET_NAME}/${fileName}`;

            console.log(`Creando lote: ${item.titulo}...`);
            await Lote.insertOne({
                titulo: item.titulo,
                descripcion: item.desc,
                cantidad: item.cant,
                peso_kg: item.peso,
                categoria: item.cat,
                estado: 'ACTIVO',
                imagen_url: imageUrl,
                fecha_caducidad: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 días desde ahora
                donante_id: new mongoose.Types.ObjectId(DONANTE_ID),
                ubicacion: {
                    type: 'Point',
                    coordinates: [-76.5161, 3.4215] // Ubicación de Cali por defecto
                },
                esta_borrado: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                __v: 0
            });
        }

        console.log('¡Seeding completado exitosamente!');
    } catch (error) {
        console.error('Error durante el seeding:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
