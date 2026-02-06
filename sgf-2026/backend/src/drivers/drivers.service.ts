import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';
import type { CreateDriverDto } from './dto/create-driver.dto';
import type { UpdateDriverDto } from './dto/update-driver.dto';

type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

@Injectable()
export class DriversService {
    async findAll(filters?: {
        status?: DriverStatus;
        departmentId?: string;
    }): Promise<any[]> {
        let query = supabaseAdmin
            .from('drivers')
            .select('*, department:departments(*)');

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.departmentId) {
            query = query.eq('department_id', filters.departmentId);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch drivers: ${error.message}`);
        }

        return data || [];
    }

    async findOne(id: string): Promise<any> {
        const { data: driver, error } = await supabaseAdmin
            .from('drivers')
            .select('*, department:departments(*)')
            .eq('id', id)
            .single();

        if (error || !driver) {
            throw new NotFoundException(`Driver with ID ${id} not found`);
        }

        return driver;
    }

    async findByCpf(cpf: string): Promise<any> {
        const { data: driver, error } = await supabaseAdmin
            .from('drivers')
            .select('*, department:departments(*)')
            .eq('cpf', cpf)
            .single();

        if (error || !driver) {
            throw new NotFoundException(`Driver with CPF ${cpf} not found`);
        }

        return driver;
    }

    async create(createDriverDto: CreateDriverDto): Promise<any> {
        const { data: driver, error } = await supabaseAdmin
            .from('drivers')
            .insert([createDriverDto])
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to create driver: ${error.message}`);
        }

        return driver;
    }

    async update(id: string, updateDriverDto: UpdateDriverDto): Promise<any> {
        // Verify driver exists first
        await this.findOne(id);

        const { data: driver, error } = await supabaseAdmin
            .from('drivers')
            .update(updateDriverDto)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to update driver: ${error.message}`);
        }

        return driver;
    }

    async remove(id: string): Promise<void> {
        // Verify driver exists first
        await this.findOne(id);

        const { error } = await supabaseAdmin
            .from('drivers')
            .delete()
            .eq('id', id);

        if (error) {
            throw new BadRequestException(`Failed to delete driver: ${error.message}`);
        }
    }

    async updateStatus(id: string, status: DriverStatus): Promise<any> {
        const { data: driver, error } = await supabaseAdmin
            .from('drivers')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error || !driver) {
            throw new NotFoundException(`Failed to update driver status: ${error?.message || 'Driver not found'}`);
        }

        return driver;
    }
}
