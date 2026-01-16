import { IsString, IsUUID, IsEnum, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ChecklistType } from '../checklist.entity';

export enum ChecklistItemStatus {
    OK = 'OK',
    PROBLEM = 'PROBLEM',
    NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export class ChecklistItemDto {
    @ApiProperty({ example: 'oil_level', description: 'ID único do item' })
    @IsString()
    itemId: string;

    @ApiProperty({ example: 'Nível de óleo do motor', description: 'Nome do item' })
    @IsString()
    name: string;

    @ApiProperty({ enum: ChecklistItemStatus, example: ChecklistItemStatus.OK })
    @IsEnum(ChecklistItemStatus)
    status: ChecklistItemStatus;

    @ApiProperty({ example: 'Óleo baixo, precisa trocar', required: false })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({ example: 'https://storage.example.com/photo.jpg', required: false })
    @IsString()
    @IsOptional()
    photoUrl?: string;

    @ApiProperty({ example: true, description: 'Item crítico bloqueia viagem se com problema' })
    @IsBoolean()
    @IsOptional()
    isCritical?: boolean;
}

export class CreateChecklistDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'ID do veículo' })
    @IsUUID()
    vehicleId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002', description: 'ID do motorista' })
    @IsUUID()
    driverId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440003', description: 'ID da viagem (opcional)', required: false })
    @IsUUID()
    @IsOptional()
    tripId?: string;

    @ApiProperty({ enum: ChecklistType, example: ChecklistType.PRE_TRIP })
    @IsEnum(ChecklistType)
    type: ChecklistType;

    @ApiProperty({ type: [ChecklistItemDto], description: 'Itens do checklist' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChecklistItemDto)
    items: ChecklistItemDto[];
}
