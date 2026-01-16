import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Refueling } from './refueling.entity';
import { CreateRefuelingDto } from './dto/create-refueling.dto';
import { VehiclesService } from '../vehicles/vehicles.service';

export enum AnomalyType {
    ODOMETER_REGRESSION = 'ODOMETER_REGRESSION',
    EXCESSIVE_CONSUMPTION = 'EXCESSIVE_CONSUMPTION',
    EXCEEDS_TANK_CAPACITY = 'EXCEEDS_TANK_CAPACITY',
    UNUSUAL_KM_PER_LITER = 'UNUSUAL_KM_PER_LITER',
}

interface ValidationResult {
    isValid: boolean;
    anomalies: AnomalyType[];
    warnings: string[];
}

@Injectable()
export class RefuelingsService {
    // Consumo médio esperado por tipo de combustível (km/l)
    private readonly expectedKmPerLiter: Record<string, { min: number; max: number }> = {
        DIESEL: { min: 6, max: 14 },
        GASOLINE: { min: 8, max: 16 },
        ETHANOL: { min: 6, max: 12 },
        FLEX: { min: 7, max: 14 },
    };

    constructor(
        @InjectRepository(Refueling)
        private readonly refuelingRepository: Repository<Refueling>,
        private readonly vehiclesService: VehiclesService,
    ) { }

    async create(createRefuelingDto: CreateRefuelingDto): Promise<Refueling> {
        const vehicle = await this.vehiclesService.findOne(createRefuelingDto.vehicleId);

        // RF-014: Validação Anti-Fraude
        const validation = await this.validateRefueling(createRefuelingDto, vehicle);

        // Calcular km/l baseado no último abastecimento
        const kmPerLiter = await this.calculateKmPerLiter(
            createRefuelingDto.vehicleId,
            createRefuelingDto.odometer,
            createRefuelingDto.liters,
        );

        const refueling = this.refuelingRepository.create({
            ...createRefuelingDto,
            kmPerLiter,
            hasAnomaly: validation.anomalies.length > 0,
            anomalyType: validation.anomalies.length > 0 ? validation.anomalies.join(', ') : null,
        });

        const savedRefueling = await this.refuelingRepository.save(refueling);

        // Atualizar odômetro do veículo
        await this.vehiclesService.updateOdometer(createRefuelingDto.vehicleId, createRefuelingDto.odometer);

        return savedRefueling;
    }

    async validateRefueling(dto: CreateRefuelingDto, vehicle: any): Promise<ValidationResult> {
        const anomalies: AnomalyType[] = [];
        const warnings: string[] = [];

        // Buscar último abastecimento deste veículo
        const lastRefueling = await this.refuelingRepository.findOne({
            where: { vehicleId: dto.vehicleId },
            order: { createdAt: 'DESC' },
        });

        // 1. Odômetro não pode ser menor que o último registro
        if (lastRefueling && dto.odometer < lastRefueling.odometer) {
            anomalies.push(AnomalyType.ODOMETER_REGRESSION);
            warnings.push(`Odometer (${dto.odometer}) is less than last recorded (${lastRefueling.odometer})`);
        }

        // 2. Litros não podem exceder capacidade do tanque
        if (vehicle.tankCapacity && dto.liters > vehicle.tankCapacity) {
            anomalies.push(AnomalyType.EXCEEDS_TANK_CAPACITY);
            warnings.push(`Liters (${dto.liters}) exceeds tank capacity (${vehicle.tankCapacity})`);
        }

        // 3. Verificar km/l dentro da faixa esperada (±30%)
        if (lastRefueling) {
            const kmSinceLastRefuel = dto.odometer - lastRefueling.odometer;
            if (kmSinceLastRefuel > 0 && dto.liters > 0) {
                const calculatedKmPerLiter = kmSinceLastRefuel / dto.liters;
                const expected = this.expectedKmPerLiter[dto.fuelType] || { min: 5, max: 20 };

                const minThreshold = expected.min * 0.7; // -30%
                const maxThreshold = expected.max * 1.3; // +30%

                if (calculatedKmPerLiter < minThreshold || calculatedKmPerLiter > maxThreshold) {
                    anomalies.push(AnomalyType.UNUSUAL_KM_PER_LITER);
                    warnings.push(
                        `km/l (${calculatedKmPerLiter.toFixed(2)}) is outside expected range ` +
                        `(${minThreshold.toFixed(1)} - ${maxThreshold.toFixed(1)})`
                    );
                }
            }
        }

        return {
            isValid: anomalies.length === 0,
            anomalies,
            warnings,
        };
    }

    private async calculateKmPerLiter(vehicleId: string, currentOdometer: number, liters: number): Promise<number | null> {
        const lastRefueling = await this.refuelingRepository.findOne({
            where: { vehicleId },
            order: { createdAt: 'DESC' },
        });

        if (!lastRefueling) {
            return null;
        }

        const kmDriven = currentOdometer - lastRefueling.odometer;
        if (kmDriven <= 0 || liters <= 0) {
            return null;
        }

        return Number((kmDriven / liters).toFixed(2));
    }

    async findAll(filters?: { vehicleId?: string; driverId?: string; hasAnomaly?: boolean }): Promise<Refueling[]> {
        const queryBuilder = this.refuelingRepository.createQueryBuilder('refueling')
            .leftJoinAndSelect('refueling.vehicle', 'vehicle')
            .leftJoinAndSelect('refueling.driver', 'driver')
            .orderBy('refueling.createdAt', 'DESC');

        if (filters?.vehicleId) {
            queryBuilder.andWhere('refueling.vehicleId = :vehicleId', { vehicleId: filters.vehicleId });
        }

        if (filters?.driverId) {
            queryBuilder.andWhere('refueling.driverId = :driverId', { driverId: filters.driverId });
        }

        if (filters?.hasAnomaly !== undefined) {
            queryBuilder.andWhere('refueling.hasAnomaly = :hasAnomaly', { hasAnomaly: filters.hasAnomaly });
        }

        return queryBuilder.getMany();
    }

    async findOne(id: string): Promise<Refueling> {
        const refueling = await this.refuelingRepository.findOne({
            where: { id },
            relations: ['vehicle', 'driver', 'trip'],
        });

        if (!refueling) {
            throw new NotFoundException(`Refueling with ID ${id} not found`);
        }

        return refueling;
    }

    async findAnomalies(): Promise<Refueling[]> {
        return this.findAll({ hasAnomaly: true });
    }

    async validateById(id: string, validatorId: string): Promise<Refueling> {
        const refueling = await this.findOne(id);

        refueling.validatedAt = new Date();
        refueling.validatedBy = validatorId;
        refueling.hasAnomaly = false; // Gestor validou manualmente
        refueling.anomalyType = null;

        return this.refuelingRepository.save(refueling);
    }

    async getVehicleConsumptionStats(vehicleId: string): Promise<any> {
        const refuelings = await this.refuelingRepository.find({
            where: { vehicleId },
            order: { createdAt: 'DESC' },
            take: 10,
        });

        if (refuelings.length === 0) {
            return { averageKmPerLiter: null, totalLiters: 0, totalCost: 0 };
        }

        const validKmPerLiter = refuelings
            .filter(r => r.kmPerLiter !== null)
            .map(r => Number(r.kmPerLiter));

        const averageKmPerLiter = validKmPerLiter.length > 0
            ? validKmPerLiter.reduce((a, b) => a + b, 0) / validKmPerLiter.length
            : null;

        const totalLiters = refuelings.reduce((sum, r) => sum + Number(r.liters), 0);
        const totalCost = refuelings.reduce((sum, r) => sum + Number(r.totalCost), 0);

        return {
            averageKmPerLiter: averageKmPerLiter?.toFixed(2),
            totalLiters: totalLiters.toFixed(2),
            totalCost: totalCost.toFixed(2),
            refuelingsCount: refuelings.length,
        };
    }
}
