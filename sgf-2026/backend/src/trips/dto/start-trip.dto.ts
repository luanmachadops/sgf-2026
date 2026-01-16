import { IsString, IsUUID, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartTripDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'ID do veículo' })
    @IsUUID()
    vehicleId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002', description: 'ID do motorista' })
    @IsUUID()
    driverId: string;

    @ApiProperty({ example: 'Secretaria de Saúde - Rua das Flores, 123', description: 'Destino da viagem' })
    @IsString()
    destination: string;

    @ApiProperty({ example: 45230, description: 'Odômetro inicial (km)' })
    @IsInt()
    @Min(0)
    startOdometer: number;

    @ApiProperty({ example: 25.5, description: 'Distância estimada (km)', required: false })
    @IsNumber()
    @IsOptional()
    estimatedDistanceKm?: number;

    @ApiProperty({ example: '-23.5505,-46.6333', description: 'Localização inicial (lat,lng)', required: false })
    @IsString()
    @IsOptional()
    startLocation?: string;
}
