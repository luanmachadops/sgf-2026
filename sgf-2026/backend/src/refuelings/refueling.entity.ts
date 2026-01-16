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

@Entity('refuelings')
export class Refueling {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'vehicle_id' })
    vehicleId: string;

    @Column({ type: 'uuid', name: 'driver_id' })
    driverId: string;

    @Column({ type: 'uuid', nullable: true, name: 'trip_id' })
    tripId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    liters: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_cost' })
    totalCost: number;

    @Column({ type: 'integer' })
    odometer: number;

    @Column({ length: 20, name: 'fuel_type' })
    fuelType: string;

    @Column({ length: 255, name: 'supplier_name' })
    supplierName: string;

    @Column({ type: 'text', nullable: true, name: 'photo_dashboard_url' })
    photoDashboardUrl: string;

    @Column({ type: 'text', nullable: true, name: 'photo_receipt_url' })
    photoReceiptUrl: string;

    @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
    location: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'km_per_liter',
    })
    kmPerLiter: number;

    @Column({ type: 'boolean', default: false, name: 'has_anomaly' })
    hasAnomaly: boolean;

    @Column({ length: 100, nullable: true, name: 'anomaly_type' })
    anomalyType: string;

    @Column({ type: 'timestamptz', nullable: true, name: 'validated_at' })
    validatedAt: Date;

    @Column({ type: 'uuid', nullable: true, name: 'validated_by' })
    validatedBy: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.refuelings, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: Vehicle;

    @ManyToOne(() => Driver, (driver) => driver.refuelings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'driver_id' })
    driver: Driver;

    @ManyToOne(() => Trip, (trip) => trip.refuelings, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;
}
