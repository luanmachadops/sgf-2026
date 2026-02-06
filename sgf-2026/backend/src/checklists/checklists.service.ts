import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase.config';
import type { CreateChecklistDto } from './dto/create-checklist.dto';

enum ChecklistItemStatus {
    OK = 'OK',
    PROBLEM = 'PROBLEM',
}

export interface ChecklistValidationResult {
    isValid: boolean;
    hasCriticalIssues: boolean;
    criticalItems: string[];
    allIssues: string[];
}

@Injectable()
export class ChecklistsService {
    async create(createChecklistDto: CreateChecklistDto): Promise<any> {
        // Verificar se há problemas nos itens
        const hasIssues = createChecklistDto.items?.some(
            item => item.status === ChecklistItemStatus.PROBLEM
        );

        const { data: checklist, error } = await supabaseAdmin
            .from('checklists')
            .insert([{
                ...createChecklistDto,
                has_issues: hasIssues,
                completed_at: new Date().toISOString(),
            }])
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to create checklist: ${error.message}`);
        }

        return checklist;
    }

    async validateChecklist(createChecklistDto: CreateChecklistDto): Promise<ChecklistValidationResult> {
        const problems = createChecklistDto.items?.filter(
            item => item.status === ChecklistItemStatus.PROBLEM
        ) || [];

        const criticalProblems = problems.filter(item => item.isCritical);

        return {
            isValid: criticalProblems.length === 0,
            hasCriticalIssues: criticalProblems.length > 0,
            criticalItems: criticalProblems.map(i => i.name),
            allIssues: problems.map(i => i.name),
        };
    }

    async findAll(filters?: { vehicleId?: string; tripId?: string; driverId?: string; hasIssues?: boolean; type?: string }): Promise<any[]> {
        let query = supabaseAdmin
            .from('checklists')
            .select('*, vehicle:vehicles(*), driver:drivers(*), trip:trips(*)')
            .order('completed_at', { ascending: false });

        if (filters?.vehicleId) {
            query = query.eq('vehicle_id', filters.vehicleId);
        }

        if (filters?.tripId) {
            query = query.eq('trip_id', filters.tripId);
        }

        if (filters?.driverId) {
            query = query.eq('driver_id', filters.driverId);
        }

        if (filters?.hasIssues !== undefined) {
            query = query.eq('has_issues', filters.hasIssues);
        }

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch checklists: ${error.message}`);
        }

        return data || [];
    }

    async findOne(id: string): Promise<any> {
        const { data: checklist, error } = await supabaseAdmin
            .from('checklists')
            .select('*, vehicle:vehicles(*), driver:drivers(*), trip:trips(*)')
            .eq('id', id)
            .single();

        if (error || !checklist) {
            throw new NotFoundException(`Checklist with ID ${id} not found`);
        }

        return checklist;
    }

    async findByTrip(tripId: string): Promise<any[]> {
        return this.findAll({ tripId });
    }

    async findWithIssues(): Promise<any[]> {
        return this.findAll({ hasIssues: true });
    }

    async getChecklistTemplate(vehicleType?: string): Promise<any[]> {
        // Template padrão de checklist (pode ser expandido por tipo de veículo)
        return [
            { itemId: 'oil_level', name: 'Nível de óleo do motor', isCritical: true },
            { itemId: 'water_level', name: 'Nível de água do radiador', isCritical: true },
            { itemId: 'tire_condition', name: 'Estado dos pneus', isCritical: true },
            { itemId: 'lights_front', name: 'Faróis dianteiros', isCritical: false },
            { itemId: 'lights_rear', name: 'Luzes traseiras', isCritical: false },
            { itemId: 'turn_signals', name: 'Setas', isCritical: false },
            { itemId: 'mirrors', name: 'Retrovisores', isCritical: false },
            { itemId: 'parking_brake', name: 'Freio de mão', isCritical: true },
            { itemId: 'triangle', name: 'Triângulo de sinalização', isCritical: false },
            { itemId: 'fire_extinguisher', name: 'Extintor de incêndio', isCritical: false },
            { itemId: 'horn', name: 'Buzina', isCritical: false },
            { itemId: 'windshield', name: 'Para-brisa', isCritical: false },
            { itemId: 'wipers', name: 'Limpadores de para-brisa', isCritical: false },
        ];
    }

    async update(id: string, updateChecklistDto: any): Promise<any> {
        // Verify checklist exists first
        await this.findOne(id);

        const { data: checklist, error } = await supabaseAdmin
            .from('checklists')
            .update(updateChecklistDto)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new BadRequestException(`Failed to update checklist: ${error.message}`);
        }

        return checklist;
    }

    async remove(id: string): Promise<void> {
        // Verify checklist exists first
        await this.findOne(id);

        const { error } = await supabaseAdmin
            .from('checklists')
            .delete()
            .eq('id', id);

        if (error) {
            throw new BadRequestException(`Failed to delete checklist: ${error.message}`);
        }
    }
}
