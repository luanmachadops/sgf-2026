import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';
import type { CreateRefuelingDto } from './dto/create-refueling.dto';
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
        private readonly vehiclesService: VehiclesService,
    ) { }

    async create(createRefuelingDto: CreateRefuelingDto): Promise<any> {
        const vehicle = await this.vehiclesService.findOne(createRefuelingDto.vehicleId);

        // RF-014: Validação Anti-Fraude
        const validation = await this.validateRefueling(createRefuelingDto, vehicle);

        // Calcular km/l baseado no último abastecimento
        const kmPerLiter = await this.calculateKmPerLiter(
            createRefuelingDto.vehicleId,
            createRefuelingDto.odometer,
            createRefuelingDto.liters,
        );

        const { data: refueling, error } = await supabaseAdmin
            .from('refuelings')
            .insert([{
                ...createRefuelingDto,
                km_per_liter: kmPerLiter,
                has_anomaly: validation.anomalies.length > 0,
                anomaly_type: validation.anomalies.length > 0 ? validation.anomalies.join(', ') : null,
            }])
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to create refueling: ${error.message}`);
        }

        // Atualizar odômetro do veículo
        await this.vehiclesService.updateOdometer(createRefuelingDto.vehicleId, createRefuelingDto.odometer);

        return refueling;
    }

    async validateRefueling(dto: CreateRefuelingDto, vehicle: any): Promise<ValidationResult> {
        const anomalies: AnomalyType[] = [];
        const warnings: string[] = [];

        // Buscar último abastecimento deste veículo
        const { data: lastRefueling } = await supabaseAdmin
            .from('refuelings')
            .select('*')
            .eq('vehicle_id', dto.vehicleId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // 1. Odômetro não pode ser menor que o último registro
        if (lastRefueling && dto.odometer < lastRefueling.odometer) {
            anomalies.push(AnomalyType.ODOMETER_REGRESSION);
            warnings.push(`Odometer (${dto.odometer}) is less than last recorded (${lastRefueling.odometer})`);
        }

        // 2. Litros não podem exceder capacidade do tanque
        if (vehicle.tank_capacity && dto.liters > vehicle.tank_capacity) {
            anomalies.push(AnomalyType.EXCEEDS_TANK_CAPACITY);
            warnings.push(`Liters (${dto.liters}) exceeds tank capacity (${vehicle.tank_capacity})`);
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
        const { data: lastRefueling } = await supabaseAdmin
            .from('refuelings')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!lastRefueling) {
            return null;
        }

        const kmDriven = currentOdometer - lastRefueling.odometer;
        if (kmDriven <= 0 || liters <= 0) {
            return null;
        }

        return Number((kmDriven / liters).toFixed(2));
    }

    async findAll(filters?: { vehicleId?: string; driverId?: string; hasAnomaly?: boolean }): Promise<any[]> {
        let query = supabaseAdmin
            .from('refuelings')
            .select('*, vehicle:vehicles(*), driver:drivers(*)')
            .order('created_at', { ascending: false });

        if (filters?.vehicleId) {
            query = query.eq('vehicle_id', filters.vehicleId);
        }

        if (filters?.driverId) {
            query = query.eq('driver_id', filters.driverId);
        }

        if (filters?.hasAnomaly !== undefined) {
            query = query.eq('has_anomaly', filters.hasAnomaly);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch refuelings: ${error.message}`);
        }

        return data || [];
    }

    async findOne(id: string): Promise<any> {
        const { data: refueling, error } = await supabaseAdmin
            .from('refuelings')
            .select('*, vehicle:vehicles(*), driver:drivers(*), trip:trips(*)')
            .eq('id', id)
            .single();

        if (error || !refueling) {
            throw new NotFoundException(`Refueling with ID ${id} not found`);
        }

        return refueling;
    }

    async findAnomalies(): Promise<any[]> {
        return this.findAll({ hasAnomaly: true });
    }

    async validateById(id: string, validatorId: string): Promise<any> {
        const refueling = await this.findOne(id);

        const { data: validated, error } = await supabaseAdmin
            .from('refuelings')
            .update({
                validated_at: new Date().toISOString(),
                validated_by: validatorId,
                has_anomaly: false, // Gestor validou manualmente
                anomaly_type: null,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to validate refueling: ${error.message}`);
        }

        return validated;
    }

    async getVehicleConsumptionStats(vehicleId: string): Promise<any> {
        const { data: refuelings, error } = await supabaseAdmin
            .from('refuelings')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error || !refuelings || refuelings.length === 0) {
            return { averageKmPerLiter: null, totalLiters: 0, totalCost: 0 };
        }

        const validKmPerLiter = refuelings
            .filter(r => r.km_per_liter !== null)
            .map(r => Number(r.km_per_liter));

        const averageKmPerLiter = validKmPerLiter.length > 0
            ? validKmPerLiter.reduce((a, b) => a + b, 0) / validKmPerLiter.length
            : null;

        const totalLiters = refuelings.reduce((sum, r) => sum + Number(r.liters), 0);
        const totalCost = refuelings.reduce((sum, r) => sum + Number(r.total_cost), 0);

        return {
            averageKmPerLiter: averageKmPerLiter?.toFixed(2),
            totalLiters: totalLiters.toFixed(2),
            totalCost: totalCost.toFixed(2),
            refuelingsCount: refuelings.length,
        };
    }
}
