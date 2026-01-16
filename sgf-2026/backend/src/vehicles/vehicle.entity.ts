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

export enum VehicleStatus {
    AVAILABLE = 'AVAILABLE',
    IN_USE = 'IN_USE',
    MAINTENANCE = 'MAINTENANCE',
    INACTIVE = 'INACTIVE',
}

export enum FuelType {
    DIESEL = 'DIESEL',
    GASOLINE = 'GASOLINE',
    ETHANOL = 'ETHANOL',
    FLEX = 'FLEX',
}

@Entity('vehicles')
export class Vehicle {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 10, unique: true })
    plate: string;

    @Column({ length: 100 })
    brand: string;

    @Column({ length: 100 })
    model: string;

    @Column({ type: 'integer' })
    year: number;

    @Column({ type: 'enum', enum: FuelType, name: 'fuel_type' })
    fuelType: FuelType;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'tank_capacity' })
    tankCapacity: number;

    @Column({ type: 'integer', default: 0, name: 'current_odometer' })
    currentOdometer: number;

    @Column({ type: 'uuid', name: 'department_id', nullable: true })
    departmentId: string;

    @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.AVAILABLE })
    status: VehicleStatus;

    @Column({ length: 255, unique: true, name: 'qr_code_hash' })
    qrCodeHash: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Department, (department) => department.vehicles, {
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @OneToMany(() => Trip, (trip) => trip.vehicle)
    trips: Trip[];

    @OneToMany(() => Refueling, (refueling) => refueling.vehicle)
    refuelings: Refueling[];

    @OneToMany(() => Maintenance, (maintenance) => maintenance.vehicle)
    maintenances: Maintenance[];

    @OneToMany(() => Checklist, (checklist) => checklist.vehicle)
    checklists: Checklist[];
}
