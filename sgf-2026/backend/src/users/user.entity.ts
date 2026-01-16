import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Department } from '../departments/department.entity';

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    VIEWER = 'VIEWER',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, unique: true })
    email: string;

    @Column({ type: 'text', name: 'password_hash' })
    passwordHash: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
    role: UserRole;

    @Column({ type: 'uuid', nullable: true, name: 'department_id' })
    departmentId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Department, (department) => department.users, {
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'department_id' })
    department: Department;
}
