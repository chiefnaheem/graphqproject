import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserData: Partial<User>): Promise<User> {
        if (!createUserData.password) {
            throw new Error('Password is required');
        }
        const hashedPassword = await bcrypt.hash(createUserData.password, 10);
        const user = this.usersRepository.create({
            ...createUserData,
            password: hashedPassword,
        });
        return this.usersRepository.save(user);
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }
}
