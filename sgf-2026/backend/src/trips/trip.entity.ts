import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Driver } from '../drivers/driver.entity';
import { Refueling } from '../refuelings/refueling.entity';
import { Checklist } from '../checklists/checklist.entity';

export enum TripStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

@Entity('trips')
export class Trip {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'vehicle_id' })
    vehicleId: string;

    @Column({ type: 'uuid', name: 'driver_id' })
    driverId: string;

    @Column({ type: 'text' })
    destination: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'estimated_distance_km',
    })
    estimatedDistanceKm: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'actual_distance_km',
    })
    actualDistanceKm: number;

    @Column({ type: 'integer', name: 'start_odometer' })
    startOdometer: number;

    @Column({ type: 'integer', nullable: true, name: 'end_odometer' })
    endOdometer: number;

    @Column({ type: 'timestamptz', name: 'start_time', default: () => 'NOW()' })
    startTime: Date;

    @Column({ type: 'timestamptz', nullable: true, name: 'end_time' })
    endTime: Date;

    @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true, name: 'start_location' })
    startLocation: string;

    @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true, name: 'end_location' })
    endLocation: string;

    @Column({ type: 'enum', enum: TripStatus, default: TripStatus.IN_PROGRESS })
    status: TripStatus;

    @Column({ type: 'boolean', default: false, name: 'has_anomaly' })
    hasAnomaly: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.trips, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: Vehicle;

    @ManyToOne(() => Driver, (driver) => driver.trips, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'driver_id' })
    driver: Driver;

    @OneToMany(() => Refueling, (refueling) => refueling.trip)
    refuelings: Refueling[];

    @OneToMany(() => Checklist, (checklist) => checklist.trip)
    checklists: Checklist[];
}
