import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));

describe('UsersService', () => {
    let service: UsersService;
    let repository: Repository<User>;

    const mockUsersRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUsersRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should successfully create a user', async () => {
            const createUserData = {
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
            };

            const mockHashedPassword = 'hashedPassword';
            (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);

            mockUsersRepository.create.mockReturnValue({
                ...createUserData,
                password: mockHashedPassword,
            });
            mockUsersRepository.save.mockResolvedValue({
                id: '1',
                ...createUserData,
                password: mockHashedPassword,
            });

            const result = await service.create(createUserData);

            expect(bcrypt.hash).toHaveBeenCalledWith(createUserData.password, 10);
            expect(repository.create).toHaveBeenCalledWith({
                ...createUserData,
                password: mockHashedPassword,
            });
            expect(repository.save).toHaveBeenCalled();
            expect(result).toEqual({
                id: '1',
                ...createUserData,
                password: mockHashedPassword,
            });
        });

        it('should throw an error if password is missing', async () => {
            const createUserData = {
                email: 'test@example.com',
                username: 'testuser',
            };

            await expect(service.create(createUserData)).rejects.toThrow('Password is required');
        });
    });

    describe('findOneByEmail', () => {
        it('should return a user if found', async () => {
            const email = 'test@example.com';
            const user = { id: '1', email, password: 'hashed' } as User;
            mockUsersRepository.findOne.mockResolvedValue(user);

            const result = await service.findOneByEmail(email);
            expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
            expect(result).toEqual(user);
        });

        it('should return null if not found', async () => {
            const email = 'notfound@example.com';
            mockUsersRepository.findOne.mockResolvedValue(null);

            const result = await service.findOneByEmail(email);
            expect(result).toBeNull();
        });
    });

    describe('findOneById', () => {
        it('should return a user if found', async () => {
            const id = '1';
            const user = { id, email: 'test@example.com' } as User;
            mockUsersRepository.findOne.mockResolvedValue(user);

            const result = await service.findOneById(id);
            expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
            expect(result).toEqual(user);
        });

        it('should return null if not found', async () => {
            const id = '999';
            mockUsersRepository.findOne.mockResolvedValue(null);

            const result = await service.findOneById(id);
            expect(result).toBeNull();
        });
    });
});
