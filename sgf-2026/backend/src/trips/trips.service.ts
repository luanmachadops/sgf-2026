import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';
import type { StartTripDto } from './dto/start-trip.dto';
import type { FinishTripDto } from './dto/finish-trip.dto';
import { VehiclesService } from '../vehicles/vehicles.service';

type TripStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'INACTIVE';

@Injectable()
export class TripsService {
    constructor(
        private readonly vehiclesService: VehiclesService,
    ) { }

    async startTrip(startTripDto: StartTripDto): Promise<any> {
        // Verificar se o veículo está disponível
        const vehicle = await this.vehiclesService.findOne(startTripDto.vehicleId);

        if (vehicle.status !== 'AVAILABLE') {
            throw new BadRequestException(`Vehicle is not available. Current status: ${vehicle.status}`);
        }

        // Verificar se já existe uma viagem em andamento para este veículo
        const { data: activeTrip } = await supabaseAdmin
            .from('trips')
            .select('*')
            .eq('vehicle_id', startTripDto.vehicleId)
            .eq('status', 'IN_PROGRESS')
            .single();

        if (activeTrip) {
            throw new BadRequestException('Vehicle already has an active trip');
        }

        // Criar a viagem
        const { data: trip, error } = await supabaseAdmin
            .from('trips')
            .insert([{
                ...startTripDto,
                status: 'IN_PROGRESS',
                start_time: new Date().toISOString(),
            }])
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to start trip: ${error.message}`);
        }

        // Atualizar status do veículo para IN_USE
        await this.vehiclesService.updateStatus(startTripDto.vehicleId, 'IN_USE');

        return trip;
    }

    async finishTrip(id: string, finishTripDto: FinishTripDto): Promise<any> {
        const trip = await this.findOne(id);

        if (trip.status !== 'IN_PROGRESS') {
            throw new BadRequestException('Trip is not in progress');
        }

        // Validação: Odômetro final deve ser >= odômetro inicial
        if (finishTripDto.endOdometer < trip.start_odometer) {
            throw new BadRequestException('End odometer cannot be less than start odometer');
        }

        // Calcular distância real se não fornecida
        const actualDistanceKm = finishTripDto.actualDistanceKm ??
            (finishTripDto.endOdometer - trip.start_odometer);

        // Detectar anomalia: Desvio > 20% da distância estimada
        let hasAnomaly = false;
        if (trip.estimated_distance_km) {
            const deviation = Math.abs(actualDistanceKm - trip.estimated_distance_km) / trip.estimated_distance_km;
            hasAnomaly = deviation > 0.2;
        }

        // Atualizar viagem
        const { data: updatedTrip, error } = await supabaseAdmin
            .from('trips')
            .update({
                end_odometer: finishTripDto.endOdometer,
                end_time: new Date().toISOString(),
                actual_distance_km: actualDistanceKm,
                status: 'COMPLETED',
                has_anomaly: hasAnomaly,
                end_location: finishTripDto.endLocation || trip.end_location,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to finish trip: ${error.message}`);
        }

        // Atualizar odômetro do veículo e liberar status
        await this.vehiclesService.updateOdometer(trip.vehicle_id, finishTripDto.endOdometer);
        await this.vehiclesService.updateStatus(trip.vehicle_id, 'AVAILABLE');

        return updatedTrip;
    }

    async cancelTrip(id: string): Promise<any> {
        const trip = await this.findOne(id);

        if (trip.status !== 'IN_PROGRESS') {
            throw new BadRequestException('Only in-progress trips can be cancelled');
        }

        const { data: updatedTrip, error } = await supabaseAdmin
            .from('trips')
            .update({
                status: 'CANCELLED',
                end_time: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to cancel trip: ${error.message}`);
        }

        // Liberar veículo
        await this.vehiclesService.updateStatus(trip.vehicle_id, 'AVAILABLE');

        return updatedTrip;
    }

    async findAll(filters?: { vehicleId?: string; driverId?: string; status?: TripStatus }): Promise<any[]> {
        let query = supabaseAdmin
            .from('trips')
            .select('*, vehicle:vehicles(*), driver:drivers(*)')
            .order('start_time', { ascending: false });

        if (filters?.vehicleId) {
            query = query.eq('vehicle_id', filters.vehicleId);
        }

        if (filters?.driverId) {
            query = query.eq('driver_id', filters.driverId);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch trips: ${error.message}`);
        }

        return data || [];
    }

    async findOne(id: string): Promise<any> {
        const { data: trip, error } = await supabaseAdmin
            .from('trips')
            .select('*, vehicle:vehicles(*), driver:drivers(*)')
            .eq('id', id)
            .single();

        if (error || !trip) {
            throw new NotFoundException(`Trip with ID ${id} not found`);
        }

        return trip;
    }

    async findAnomalies(): Promise<any[]> {
        const { data, error } = await supabaseAdmin
            .from('trips')
            .select('*, vehicle:vehicles(*), driver:drivers(*)')
            .eq('has_anomaly', true)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch anomalies: ${error.message}`);
        }

        return data || [];
    }

    async getDriverTrips(driverId: string): Promise<any[]> {
        return this.findAll({ driverId });
    }

    async getVehicleTrips(vehicleId: string): Promise<any[]> {
        return this.findAll({ vehicleId });
    }
}
