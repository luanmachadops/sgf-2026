import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDriverDto } from './create-driver.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DriverStatus } from '../driver.entity';

export class UpdateDriverDto extends PartialType(
    OmitType(CreateDriverDto, ['password'] as const)
) {
    @ApiProperty({ enum: DriverStatus, example: DriverStatus.ACTIVE, description: 'Status do motorista', required: false })
    @IsEnum(DriverStatus)
    @IsOptional()
    status?: DriverStatus;
}
