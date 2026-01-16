import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Driver } from '../drivers/driver.entity';
import { Trip } from '../trips/trip.entity';

export enum ChecklistType {
    PRE_TRIP = 'PRE_TRIP',
    POST_TRIP = 'POST_TRIP',
}

@Entity('checklists')
export class Checklist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'vehicle_id' })
    vehicleId: string;

    @Column({ type: 'uuid', name: 'driver_id' })
    driverId: string;

    @Column({ type: 'uuid', nullable: true, name: 'trip_id' })
    tripId: string;

    @Column({ type: 'enum', enum: ChecklistType })
    type: ChecklistType;

    @Column({ type: 'boolean', default: false, name: 'has_issues' })
    hasIssues: boolean;

    @Column({ type: 'jsonb' })
    items: any;

    @CreateDateColumn({ name: 'completed_at' })
    completedAt: Date;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.checklists, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: Vehicle;

    @ManyToOne(() => Driver, (driver) => driver.checklists, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'driver_id' })
    driver: Driver;

    @ManyToOne(() => Trip, (trip) => trip.checklists, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;
}
