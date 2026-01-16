import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checklist, ChecklistType } from './checklist.entity';
import { CreateChecklistDto, ChecklistItemStatus } from './dto/create-checklist.dto';

export interface ChecklistValidationResult {
    isValid: boolean;
    hasCriticalIssues: boolean;
    criticalItems: string[];
    allIssues: string[];
}

@Injectable()
export class ChecklistsService {
    constructor(
        @InjectRepository(Checklist)
        private readonly checklistRepository: Repository<Checklist>,
    ) { }

    async create(createChecklistDto: CreateChecklistDto): Promise<Checklist> {
        // Verificar se há problemas nos itens
        const hasIssues = createChecklistDto.items.some(
            item => item.status === ChecklistItemStatus.PROBLEM
        );

        // Verificar se há problemas em itens críticos
        const criticalIssues = createChecklistDto.items.filter(
            item => item.isCritical && item.status === ChecklistItemStatus.PROBLEM
        );

        // Se for PRE_TRIP e houver problemas críticos, bloquear
        if (createChecklistDto.type === ChecklistType.PRE_TRIP && criticalIssues.length > 0) {
            const criticalItemNames = criticalIssues.map(i => i.name).join(', ');
            throw new BadRequestException(
                `Cannot start trip: Critical issues found in: ${criticalItemNames}. ` +
                `Please request maintenance before proceeding.`
            );
        }

        const checklist = this.checklistRepository.create({
            vehicleId: createChecklistDto.vehicleId,
            driverId: createChecklistDto.driverId,
            tripId: createChecklistDto.tripId,
            type: createChecklistDto.type,
            hasIssues,
            items: createChecklistDto.items,
            completedAt: new Date(),
        });

        return this.checklistRepository.save(checklist);
    }

    async validateChecklist(createChecklistDto: CreateChecklistDto): Promise<ChecklistValidationResult> {
        const problems = createChecklistDto.items.filter(
            item => item.status === ChecklistItemStatus.PROBLEM
        );

        const criticalProblems = problems.filter(item => item.isCritical);

        return {
            isValid: criticalProblems.length === 0,
            hasCriticalIssues: criticalProblems.length > 0,
            criticalItems: criticalProblems.map(i => i.name),
            allIssues: problems.map(i => i.name),
        };
    }

    async findAll(filters?: { vehicleId?: string; driverId?: string; type?: ChecklistType; hasIssues?: boolean }): Promise<Checklist[]> {
        const queryBuilder = this.checklistRepository.createQueryBuilder('checklist')
            .leftJoinAndSelect('checklist.vehicle', 'vehicle')
            .leftJoinAndSelect('checklist.driver', 'driver')
            .orderBy('checklist.completedAt', 'DESC');

        if (filters?.vehicleId) {
            queryBuilder.andWhere('checklist.vehicleId = :vehicleId', { vehicleId: filters.vehicleId });
        }

        if (filters?.driverId) {
            queryBuilder.andWhere('checklist.driverId = :driverId', { driverId: filters.driverId });
        }

        if (filters?.type) {
            queryBuilder.andWhere('checklist.type = :type', { type: filters.type });
        }

        if (filters?.hasIssues !== undefined) {
            queryBuilder.andWhere('checklist.hasIssues = :hasIssues', { hasIssues: filters.hasIssues });
        }

        return queryBuilder.getMany();
    }

    async findOne(id: string): Promise<Checklist> {
        const checklist = await this.checklistRepository.findOne({
            where: { id },
            relations: ['vehicle', 'driver', 'trip'],
        });

        if (!checklist) {
            throw new NotFoundException(`Checklist with ID ${id} not found`);
        }

        return checklist;
    }

    async findByTrip(tripId: string): Promise<Checklist[]> {
        return this.checklistRepository.find({
            where: { tripId },
            relations: ['vehicle', 'driver'],
            order: { completedAt: 'ASC' },
        });
    }

    async findWithIssues(): Promise<Checklist[]> {
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
}
