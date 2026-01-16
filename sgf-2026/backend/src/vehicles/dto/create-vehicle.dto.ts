import { IsString, IsInt, IsEnum, IsDecimal, IsUUID, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FuelType, VehicleStatus } from '../vehicle.entity';

export class CreateVehicleDto {
    @ApiProperty({ example: 'ABC1234', description: 'Placa do veículo' })
    @IsString()
    plate: string;

    @ApiProperty({ example: 'Volkswagen', description: 'Marca do veículo' })
    @IsString()
    brand: string;

    @ApiProperty({ example: 'Gol', description: 'Modelo do veículo' })
    @IsString()
    model: string;

    @ApiProperty({ example: 2020, description: 'Ano do veículo', minimum: 1990, maximum: 2030 })
    @IsInt()
    @Min(1990)
    @Max(2030)
    year: number;

    @ApiProperty({ enum: FuelType, example: FuelType.FLEX, description: 'Tipo de combustível' })
    @IsEnum(FuelType)
    fuelType: FuelType;

    @ApiProperty({ example: 50.0, description: 'Capacidade do tanque (litros)' })
    @IsDecimal({ decimal_digits: '2' })
    tankCapacity: number;

    @ApiProperty({ example: 0, description: 'Odômetro atual (km)' })
    @IsInt()
    @Min(0)
    currentOdometer: number;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'ID da secretaria', required: false })
    @IsUUID()
    @IsOptional()
    departmentId?: string;

    @ApiProperty({ enum: VehicleStatus, example: VehicleStatus.AVAILABLE, description: 'Status do veículo' })
    @IsEnum(VehicleStatus)
    @IsOptional()
    status?: VehicleStatus;

    @ApiProperty({ example: 'QR_ABC1234_HASH_001', description: 'Hash do QR Code do veículo' })
    @IsString()
    qrCodeHash: string;
}
