import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Department } from '../departments/department.entity';
import { Trip } from '../trips/trip.entity';
import { Refueling } from '../refuelings/refueling.entity';
import { Maintenance } from '../maintenances/maintenance.entity';
import { Checklist } from '../checklists/checklist.entity';

export enum DriverStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

@Entity('drivers')
export class Driver {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 11, unique: true })
    cpf: string;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 50, name: 'registration_number' })
    registrationNumber: string;

    @Column({ length: 20, name: 'cnh_number' })
    cnhNumber: string;

    @Column({ length: 10, name: 'cnh_category' })
    cnhCategory: string;

    @Column({ type: 'date', name: 'cnh_expiry_date' })
    cnhExpiryDate: Date;

    @Column({ type: 'uuid', name: 'department_id', nullable: true })
    departmentId: string;

    @Column({ length: 20, nullable: true })
    phone: string;

    @Column({ length: 255, nullable: true })
    email: string;

    @Column({ type: 'text', name: 'password_hash' })
    passwordHash: string;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
    score: number;

    @Column({ type: 'enum', enum: DriverStatus, default: DriverStatus.ACTIVE })
    status: DriverStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Department, (department) => department.drivers, {
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @OneToMany(() => Trip, (trip) => trip.driver)
    trips: Trip[];

    @OneToMany(() => Refueling, (refueling) => refueling.driver)
    refuelings: Refueling[];

    @OneToMany(() => Maintenance, (maintenance) => maintenance.requestedBy)
    requestedMaintenances: Maintenance[];

    @OneToMany(() => Checklist, (checklist) => checklist.driver)
    checklists: Checklist[];
}
