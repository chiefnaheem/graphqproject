import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { FileUpload } from 'graphql-upload-ts';
import { IStorageProvider, UploadResult } from '../interfaces/storage-provider.interface';

@Injectable()
export class MinioStorageProvider implements IStorageProvider, OnModuleInit {
    private minioClient: Minio.Client;
    private bucketName: string;
    private readonly logger = new Logger(MinioStorageProvider.name);

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get('MINIO_BUCKET', 'uploads');
    }

    onModuleInit() {
        this.minioClient = new Minio.Client({
            endPoint: this.configService.getOrThrow<string>('MINIO_ENDPOINT'),
            port: this.configService.getOrThrow<number>('MINIO_PORT'),
            useSSL: this.configService.getOrThrow<boolean>('MINIO_USE_SSL'),
            accessKey: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
            secretKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
        });

        this.ensureBucket();
    }

    private async ensureBucket() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                this.logger.log(`Bucket ${this.bucketName} created successfully`);
            }
        } catch (err) {
            this.logger.error('Error checking/creating bucket', err);
        }
    }

    async upload(file: FileUpload, key: string): Promise<UploadResult> {
        const { createReadStream, mimetype } = file;
        const stream = createReadStream();

        await this.minioClient.putObject(this.bucketName, key, stream as any, undefined, {
            'Content-Type': mimetype,
        });

        // MinIO doesn't return size on putObject, so we stat it
        const stat = await this.stat(key);

        return {
            key,
            size: stat.size,
        };
    }

    async delete(key: string): Promise<void> {
        await this.minioClient.removeObject(this.bucketName, key);
    }

    async stat(key: string): Promise<{ size: number }> {
        const stat = await this.minioClient.statObject(this.bucketName, key);
        return { size: stat.size };
    }
}
