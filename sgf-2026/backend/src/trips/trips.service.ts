import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from './trip.entity';
import { StartTripDto } from './dto/start-trip.dto';
import { FinishTripDto } from './dto/finish-trip.dto';
import { VehiclesService } from '../vehicles/vehicles.service';
import { VehicleStatus } from '../vehicles/vehicle.entity';

@Injectable()
export class TripsService {
    constructor(
        @InjectRepository(Trip)
        private readonly tripRepository: Repository<Trip>,
        private readonly vehiclesService: VehiclesService,
    ) { }

    async startTrip(startTripDto: StartTripDto): Promise<Trip> {
        // Verificar se o veículo está disponível
        const vehicle = await this.vehiclesService.findOne(startTripDto.vehicleId);

        if (vehicle.status !== VehicleStatus.AVAILABLE) {
            throw new BadRequestException(`Vehicle is not available. Current status: ${vehicle.status}`);
        }

        // Verificar se já existe uma viagem em andamento para este veículo
        const activeTrip = await this.tripRepository.findOne({
            where: {
                vehicleId: startTripDto.vehicleId,
                status: TripStatus.IN_PROGRESS,
            },
        });

        if (activeTrip) {
            throw new BadRequestException('Vehicle already has an active trip');
        }

        // Criar a viagem
        const trip = this.tripRepository.create({
            ...startTripDto,
            status: TripStatus.IN_PROGRESS,
            startTime: new Date(),
        });

        const savedTrip = await this.tripRepository.save(trip);

        // Atualizar status do veículo para IN_USE
        await this.vehiclesService.updateStatus(startTripDto.vehicleId, VehicleStatus.IN_USE);

        return savedTrip;
    }

    async finishTrip(id: string, finishTripDto: FinishTripDto): Promise<Trip> {
        const trip = await this.findOne(id);

        if (trip.status !== TripStatus.IN_PROGRESS) {
            throw new BadRequestException('Trip is not in progress');
        }

        // Validação: Odômetro final deve ser >= odômetro inicial
        if (finishTripDto.endOdometer < trip.startOdometer) {
            throw new BadRequestException('End odometer cannot be less than start odometer');
        }

        // Calcular distância real se não fornecida
        const actualDistanceKm = finishTripDto.actualDistanceKm ??
            (finishTripDto.endOdometer - trip.startOdometer);

        // Detectar anomalia: Desvio > 20% da distância estimada
        let hasAnomaly = false;
        if (trip.estimatedDistanceKm) {
            const deviation = Math.abs(actualDistanceKm - trip.estimatedDistanceKm) / trip.estimatedDistanceKm;
            hasAnomaly = deviation > 0.2;
        }

        // Atualizar viagem
        trip.endOdometer = finishTripDto.endOdometer;
        trip.endTime = new Date();
        trip.actualDistanceKm = actualDistanceKm;
        trip.status = TripStatus.COMPLETED;
        trip.hasAnomaly = hasAnomaly;

        if (finishTripDto.endLocation) {
            trip.endLocation = finishTripDto.endLocation;
        }

        const savedTrip = await this.tripRepository.save(trip);

        // Atualizar odômetro do veículo e liberar status
        await this.vehiclesService.updateOdometer(trip.vehicleId, finishTripDto.endOdometer);
        await this.vehiclesService.updateStatus(trip.vehicleId, VehicleStatus.AVAILABLE);

        return savedTrip;
    }

    async cancelTrip(id: string): Promise<Trip> {
        const trip = await this.findOne(id);

        if (trip.status !== TripStatus.IN_PROGRESS) {
            throw new BadRequestException('Only in-progress trips can be cancelled');
        }

        trip.status = TripStatus.CANCELLED;
        trip.endTime = new Date();

        const savedTrip = await this.tripRepository.save(trip);

        // Liberar veículo
        await this.vehiclesService.updateStatus(trip.vehicleId, VehicleStatus.AVAILABLE);

        return savedTrip;
    }

    async findAll(filters?: { vehicleId?: string; driverId?: string; status?: TripStatus }): Promise<Trip[]> {
        const queryBuilder = this.tripRepository.createQueryBuilder('trip')
            .leftJoinAndSelect('trip.vehicle', 'vehicle')
            .leftJoinAndSelect('trip.driver', 'driver')
            .orderBy('trip.startTime', 'DESC');

        if (filters?.vehicleId) {
            queryBuilder.andWhere('trip.vehicleId = :vehicleId', { vehicleId: filters.vehicleId });
        }

        if (filters?.driverId) {
            queryBuilder.andWhere('trip.driverId = :driverId', { driverId: filters.driverId });
        }

        if (filters?.status) {
            queryBuilder.andWhere('trip.status = :status', { status: filters.status });
        }

        return queryBuilder.getMany();
    }

    async findOne(id: string): Promise<Trip> {
        const trip = await this.tripRepository.findOne({
            where: { id },
            relations: ['vehicle', 'driver'],
        });

        if (!trip) {
            throw new NotFoundException(`Trip with ID ${id} not found`);
        }

        return trip;
    }

    async findAnomalies(): Promise<Trip[]> {
        return this.tripRepository.find({
            where: { hasAnomaly: true },
            relations: ['vehicle', 'driver'],
            order: { createdAt: 'DESC' },
        });
    }

    async getDriverTrips(driverId: string): Promise<Trip[]> {
        return this.findAll({ driverId });
    }

    async getVehicleTrips(vehicleId: string): Promise<Trip[]> {
        return this.findAll({ vehicleId });
    }
}
