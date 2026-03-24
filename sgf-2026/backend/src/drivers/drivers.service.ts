import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';
import type { CreateDriverDto } from './dto/create-driver.dto';
import type { UpdateDriverDto } from './dto/update-driver.dto';
import type { DriverAccessDto } from './dto/driver-access.dto';

type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
type DriverRecord = {
    id: string;
    cpf: string;
    name: string;
    email: string | null;
    phone: string | null;
    department_id: string | null;
    registration_number: string;
    cnh_number: string;
    cnh_category: string;
    cnh_expiry_date: string;
    status: DriverStatus;
    user_id: string | null;
};

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
        const normalizedCpf = this.normalizeCpf(createDriverDto.cpf);
        const { password, ...driverInput } = createDriverDto;

        const { data: existingDriver, error: existingDriverError } = await supabaseAdmin
            .from('drivers')
            .select('id')
            .eq('cpf', normalizedCpf)
            .maybeSingle();

        if (existingDriverError) {
            throw new BadRequestException(`Failed to validate driver CPF: ${existingDriverError.message}`);
        }

        if (existingDriver) {
            throw new BadRequestException('Driver with this CPF already exists');
        }

        const authEmail = this.buildDriverAuthEmail(normalizedCpf);
        const { data: authUserData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: authEmail,
            password,
            email_confirm: true,
            user_metadata: {
                cpf: normalizedCpf,
                name: driverInput.name,
                type: 'driver',
            },
        });

        if (authError || !authUserData.user) {
            throw new BadRequestException(`Failed to create driver access: ${authError?.message || 'Unknown auth error'}`);
        }

        const driverRow = this.mapCreateDtoToDriverRow(driverInput, normalizedCpf, authUserData.user.id);
        const { data: driver, error } = await supabaseAdmin
            .from('drivers')
            .insert([driverRow])
            .select('*, department:departments(*)')
            .single();

        if (error) {
            await supabaseAdmin.auth.admin.deleteUser(authUserData.user.id);
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

    async provisionAccess(id: string, accessDto: DriverAccessDto): Promise<any> {
        const driver = await this.findDriverRecord(id);

        if (driver.user_id) {
            throw new BadRequestException('Driver already has access configured');
        }

        const authEmail = this.buildDriverAuthEmail(driver.cpf);
        const { data: authUserData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: authEmail,
            password: accessDto.password,
            email_confirm: true,
            user_metadata: {
                cpf: driver.cpf,
                name: driver.name,
                type: 'driver',
            },
        });

        if (authError || !authUserData.user) {
            throw new BadRequestException(`Failed to provision driver access: ${authError?.message || 'Unknown auth error'}`);
        }

        const { data: updatedDriver, error: updateError } = await supabaseAdmin
            .from('drivers')
            .update({ user_id: authUserData.user.id })
            .eq('id', id)
            .select('*, department:departments(*)')
            .single();

        if (updateError) {
            await supabaseAdmin.auth.admin.deleteUser(authUserData.user.id);
            throw new BadRequestException(`Failed to link driver access: ${updateError.message}`);
        }

        return updatedDriver;
    }

    async resetPassword(id: string, accessDto: DriverAccessDto): Promise<{ success: true }> {
        const driver = await this.findDriverRecord(id);

        if (!driver.user_id) {
            throw new BadRequestException('Driver does not have access configured yet');
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(driver.user_id, {
            password: accessDto.password,
        });

        if (error) {
            throw new BadRequestException(`Failed to reset driver password: ${error.message}`);
        }

        return { success: true };
    }

    private async findDriverRecord(id: string): Promise<DriverRecord> {
        const { data: driver, error } = await supabaseAdmin
            .from('drivers')
            .select('id, cpf, name, email, phone, department_id, registration_number, cnh_number, cnh_category, cnh_expiry_date, status, user_id')
            .eq('id', id)
            .single();

        if (error || !driver) {
            throw new NotFoundException(`Driver with ID ${id} not found`);
        }

        return driver as DriverRecord;
    }

    private mapCreateDtoToDriverRow(
        driverInput: Omit<CreateDriverDto, 'password'>,
        normalizedCpf: string,
        authUserId: string
    ) {
        return {
            cpf: normalizedCpf,
            name: driverInput.name,
            registration_number: driverInput.registrationNumber,
            cnh_number: driverInput.cnhNumber,
            cnh_category: driverInput.cnhCategory,
            cnh_expiry_date: driverInput.cnhExpiryDate,
            department_id: driverInput.departmentId ?? null,
            phone: driverInput.phone?.trim() || null,
            email: driverInput.email?.trim().toLowerCase() || null,
            status: driverInput.status ?? 'ACTIVE',
            user_id: authUserId,
            password_hash: null,
        };
    }

    private buildDriverAuthEmail(cpf: string): string {
        return `driver-${cpf}@internal.sgf2026.local`;
    }

    private normalizeCpf(cpf: string): string {
        return cpf.replace(/\D/g, '');
    }
}
