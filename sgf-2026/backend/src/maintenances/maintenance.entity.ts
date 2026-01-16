import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Driver } from '../drivers/driver.entity';

export enum MaintenanceType {
    PREVENTIVE = 'PREVENTIVE',
    CORRECTIVE = 'CORRECTIVE',
    EMERGENCY = 'EMERGENCY',
}

export enum MaintenanceCategory {
    MECHANICAL = 'MECHANICAL',
    ELECTRICAL = 'ELECTRICAL',
    TIRES = 'TIRES',
    BODY = 'BODY',
}

export enum MaintenanceStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

@Entity('maintenances')
export class Maintenance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'vehicle_id' })
    vehicleId: string;

    @Column({ type: 'uuid', name: 'requested_by' })
    requestedBy: string;

    @Column({ type: 'enum', enum: MaintenanceType })
    type: MaintenanceType;

    @Column({ type: 'enum', enum: MaintenanceCategory })
    category: MaintenanceCategory;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'integer' })
    urgency: number;

    @Column({
        type: 'enum',
        enum: MaintenanceStatus,
        default: MaintenanceStatus.PENDING,
    })
    status: MaintenanceStatus;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'estimated_cost',
    })
    estimatedCost: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'actual_cost',
    })
    actualCost: number;

    @Column({ type: 'uuid', nullable: true, name: 'approved_by' })
    approvedBy: string;

    @Column({ type: 'timestamptz', nullable: true, name: 'approved_at' })
    approvedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.maintenances, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: Vehicle;

    @ManyToOne(() => Driver, (driver) => driver.requestedMaintenances, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'requested_by' })
    requester: Driver;
}
