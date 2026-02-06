import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';
import type { CreateVehicleDto } from './dto/create-vehicle.dto';
import type { UpdateVehicleDto } from './dto/update-vehicle.dto';

type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'INACTIVE';

@Injectable()
export class VehiclesService {
    async findAll(filters?: {
        status?: VehicleStatus;
        departmentId?: string;
    }): Promise<any[]> {
        let query = supabaseAdmin
            .from('vehicles')
            .select('*, department:departments(*)');

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.departmentId) {
            query = query.eq('department_id', filters.departmentId);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch vehicles: ${error.message}`);
        }

        return data || [];
    }

    async findOne(id: string): Promise<any> {
        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .select(`
                *,
                department:departments(*),
                trips:trips(*),
                refuelings:refuelings(*),
                maintenances:maintenances(*)
            `)
            .eq('id', id)
            .single();

        if (error || !vehicle) {
            throw new NotFoundException(`Vehicle with ID ${id} not found`);
        }

        return vehicle;
    }

    async findByPlate(plate: string): Promise<any> {
        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .select('*, department:departments(*)')
            .eq('plate', plate)
            .single();

        if (error || !vehicle) {
            throw new NotFoundException(`Vehicle with plate ${plate} not found`);
        }

        return vehicle;
    }

    async findByQrCode(qrCodeHash: string): Promise<any> {
        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .select('*, department:departments(*)')
            .eq('qr_code_hash', qrCodeHash)
            .single();

        if (error || !vehicle) {
            throw new NotFoundException(`Vehicle with QR code not found`);
        }

        return vehicle;
    }

    async create(createVehicleDto: CreateVehicleDto): Promise<any> {
        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .insert([createVehicleDto])
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to create vehicle: ${error.message}`);
        }

        return vehicle;
    }

    async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<any> {
        // Verify vehicle exists first
        await this.findOne(id);

        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .update(updateVehicleDto)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to update vehicle: ${error.message}`);
        }

        return vehicle;
    }

    async remove(id: string): Promise<void> {
        // Verify vehicle exists first
        await this.findOne(id);

        const { error } = await supabaseAdmin
            .from('vehicles')
            .delete()
            .eq('id', id);

        if (error) {
            throw new BadRequestException(`Failed to delete vehicle: ${error.message}`);
        }
    }

    async updateStatus(id: string, status: VehicleStatus): Promise<any> {
        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error || !vehicle) {
            throw new NotFoundException(`Failed to update vehicle status: ${error?.message || 'Vehicle not found'}`);
        }

        return vehicle;
    }

    async updateOdometer(id: string, odometer: number): Promise<any> {
        // Get current odometer first
        const { data: currentVehicle } = await supabaseAdmin
            .from('vehicles')
            .select('current_odometer')
            .eq('id', id)
            .single();

        if (!currentVehicle) {
            throw new NotFoundException(`Vehicle with ID ${id} not found`);
        }

        if (odometer < currentVehicle.current_odometer) {
            throw new BadRequestException('Odometer cannot go backwards');
        }

        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .update({ current_odometer: odometer })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to update odometer: ${error.message}`);
        }

        return vehicle;
    }

    async updatePhoto(id: string, photoUrl: string): Promise<any> {
        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .update({ photo_url: photoUrl })
            .eq('id', id)
            .select()
            .single();

        if (error || !vehicle) {
            throw new NotFoundException(`Failed to update vehicle photo: ${error?.message || 'Vehicle not found'}`);
        }

        return vehicle;
    }
}
