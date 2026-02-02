import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@ObjectType()
@Entity('files')
export class File {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column()
    filename: string;

    @Field()
    @Column()
    mimetype: string;

    @Field(() => Int)
    @Column('int')
    size: number;

    @Column()
    key: string; // MinIO/S3 key

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @Field()
    @CreateDateColumn()
    createdAt: Date;
}
