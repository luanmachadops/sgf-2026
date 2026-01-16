import { IsString, IsUUID, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRefuelingDto {
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

    @ApiProperty({ example: 50.5, description: 'Litros abastecidos' })
    @IsNumber()
    @Min(0.1)
    liters: number;

    @ApiProperty({ example: 325.75, description: 'Valor total (R$)' })
    @IsNumber()
    @Min(0.01)
    totalCost: number;

    @ApiProperty({ example: 45230, description: 'Odômetro atual (km)' })
    @IsNumber()
    @Min(0)
    odometer: number;

    @ApiProperty({ example: 'DIESEL', description: 'Tipo de combustível' })
    @IsString()
    fuelType: string;

    @ApiProperty({ example: 'Posto Shell Centro', description: 'Nome do posto/fornecedor' })
    @IsString()
    supplierName: string;

    @ApiProperty({ example: 'https://storage.example.com/dashboard.jpg', description: 'URL da foto do painel' })
    @IsString()
    photoDashboardUrl: string;

    @ApiProperty({ example: 'https://storage.example.com/receipt.jpg', description: 'URL da foto do comprovante' })
    @IsString()
    photoReceiptUrl: string;

    @ApiProperty({ example: '-23.5505,-46.6333', description: 'Localização (lat,lng)', required: false })
    @IsString()
    @IsOptional()
    location?: string;
}
