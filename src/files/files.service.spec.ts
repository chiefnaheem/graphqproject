import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { File } from './file.entity';
import { Repository } from 'typeorm';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import { User } from '../users/user.entity';

describe('FilesService', () => {
    let service: FilesService;
    let repository: Repository<File>;

    const mockStorageProvider = {
        upload: jest.fn(),
        delete: jest.fn(),
        stat: jest.fn(),
    };

    const mockFilesRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FilesService,
                {
                    provide: getRepositoryToken(File),
                    useValue: mockFilesRepository,
                },
                {
                    provide: STORAGE_PROVIDER,
                    useValue: mockStorageProvider,
                },
            ],
        }).compile();

        service = module.get<FilesService>(FilesService);
        repository = module.get<Repository<File>>(getRepositoryToken(File));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('uploadFile', () => {
        it('should upload file and save metadata', async () => {
            const user = { id: 'u1' } as User;
            const fileUpload = {
                filename: 'test.jpg',
                mimetype: 'image/jpeg',
                createReadStream: jest.fn(),
            } as any;

            const uploadResult = {
                key: 'u1/uuid-test.jpg',
                size: 1024,
            };

            mockStorageProvider.upload.mockResolvedValue(uploadResult);
            mockFilesRepository.create.mockReturnValue({
                filename: fileUpload.filename,
                mimetype: fileUpload.mimetype,
                key: uploadResult.key,
                size: uploadResult.size,
                user,
            });
            mockFilesRepository.save.mockResolvedValue({
                id: 'f1',
                filename: fileUpload.filename,
            });

            const result = await service.uploadFile(fileUpload, user);

            expect(mockStorageProvider.upload).toHaveBeenCalledWith(fileUpload, expect.stringContaining(user.id));
            expect(repository.create).toHaveBeenCalledWith({
                filename: fileUpload.filename,
                mimetype: fileUpload.mimetype,
                size: uploadResult.size,
                key: uploadResult.key,
                user,
            });
            expect(repository.save).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });

    describe('getMetrics', () => {
        it('should calculate metrics correctly', async () => {
            const user = { id: 'u1' } as User;
            const now = new Date();
            const files = [
                { size: 100, createdAt: now },
                { size: 200, createdAt: now },
            ] as File[];

            mockFilesRepository.find.mockResolvedValue(files);

            const metrics = await service.getMetrics(user);

            expect(metrics.totalFiles).toBe(2);
            expect(metrics.totalStorage).toBe(300);
            expect(metrics.uploadsPerDay.length).toBe(1);
            expect(metrics.uploadsPerDay[0].count).toBe(2);
        });
    });
});
