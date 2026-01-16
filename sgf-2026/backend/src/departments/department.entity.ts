import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Driver } from '../drivers/driver.entity';
import { User } from '../users/user.entity';

@Entity('departments')
export class Department {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 50, unique: true })
    code: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => Vehicle, (vehicle) => vehicle.department)
    vehicles: Vehicle[];

    @OneToMany(() => Driver, (driver) => driver.department)
    drivers: Driver[];

    @OneToMany(() => User, (user) => user.department)
    users: User[];
}
