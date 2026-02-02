import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';
import { FilesService } from './files.service';
import { FilesResolver } from './files.resolver';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import { MinioStorageProvider } from './providers/minio.provider';

@Module({
    imports: [TypeOrmModule.forFeature([File])],
    providers: [
        FilesService,
        FilesResolver,
        {
            provide: STORAGE_PROVIDER,
            useClass: MinioStorageProvider,
        },
    ],
    exports: [FilesService],
})
export class FilesModule { }
