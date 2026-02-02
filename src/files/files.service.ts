import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { User } from '../users/user.entity';
import { FileUpload } from 'graphql-upload-ts';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import type { IStorageProvider } from './interfaces/storage-provider.interface';

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(File)
        private filesRepository: Repository<File>,
        @Inject(STORAGE_PROVIDER)
        private storageProvider: IStorageProvider,
    ) { }

    async uploadFile(file: FileUpload, user: User): Promise<File> {
        const { filename, mimetype } = file;
        const key = `${user.id}/${uuidv4()}-${filename}`;

        // Upload via provider
        const result = await this.storageProvider.upload(file, key);

        // Save metadata
        const newFile = this.filesRepository.create({
            filename,
            mimetype,
            size: result.size,
            key: result.key,
            user,
        });

        return this.filesRepository.save(newFile);
    }

    async findByUser(user: User): Promise<File[]> {
        return this.filesRepository.find({ where: { user: { id: user.id } } });
    }

    async getMetrics(user: User) {
        const files = await this.filesRepository.find({ where: { user: { id: user.id } } });
        const totalFiles = files.length;
        const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);

        const uploadsPerDay = files.reduce((acc, file) => {
            const date = file.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        return {
            totalFiles,
            totalStorage: totalSize,
            uploadsPerDay: Object.entries(uploadsPerDay).map(([date, count]) => ({ date, count })),
        };
    }
}
