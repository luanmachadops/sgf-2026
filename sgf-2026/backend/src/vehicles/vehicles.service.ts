import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from './vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
    constructor(
        @InjectRepository(Vehicle)
        private vehiclesRepository: Repository<Vehicle>,
    ) { }

    async findAll(filters?: {
        status?: VehicleStatus;
        departmentId?: string;
    }): Promise<Vehicle[]> {
        const query = this.vehiclesRepository.createQueryBuilder('vehicle');

        if (filters?.status) {
            query.andWhere('vehicle.status = :status', { status: filters.status });
        }

        if (filters?.departmentId) {
            query.andWhere('vehicle.departmentId = :departmentId', {
                departmentId: filters.departmentId,
            });
        }

        query.leftJoinAndSelect('vehicle.department', 'department');

        return query.getMany();
    }

    async findOne(id: string): Promise<Vehicle> {
        const vehicle = await this.vehiclesRepository.findOne({
            where: { id },
            relations: ['department', 'trips', 'refuelings', 'maintenances'],
        });

        if (!vehicle) {
            throw new NotFoundException(`Vehicle with ID ${id} not found`);
        }

        return vehicle;
    }

    async findByPlate(plate: string): Promise<Vehicle> {
        const vehicle = await this.vehiclesRepository.findOne({
            where: { plate },
            relations: ['department'],
        });

        if (!vehicle) {
            throw new NotFoundException(`Vehicle with plate ${plate} not found`);
        }

        return vehicle;
    }

    async findByQrCode(qrCodeHash: string): Promise<Vehicle> {
        const vehicle = await this.vehiclesRepository.findOne({
            where: { qrCodeHash },
            relations: ['department'],
        });

        if (!vehicle) {
            throw new NotFoundException(`Vehicle with QR code not found`);
        }

        return vehicle;
    }

    async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
        const vehicle = this.vehiclesRepository.create(createVehicleDto);
        return this.vehiclesRepository.save(vehicle);
    }

    async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
        const vehicle = await this.findOne(id);
        Object.assign(vehicle, updateVehicleDto);
        return this.vehiclesRepository.save(vehicle);
    }

    async remove(id: string): Promise<void> {
        const vehicle = await this.findOne(id);
        await this.vehiclesRepository.remove(vehicle);
    }

    async updateStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
        const vehicle = await this.findOne(id);
        vehicle.status = status;
        return this.vehiclesRepository.save(vehicle);
    }

    async updateOdometer(id: string, odometer: number): Promise<Vehicle> {
        const vehicle = await this.findOne(id);

        if (odometer < vehicle.currentOdometer) {
            throw new Error('Odometer cannot go backwards');
        }

        vehicle.currentOdometer = odometer;
        return this.vehiclesRepository.save(vehicle);
    }
}
