import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FinishTripDto {
    @ApiProperty({ example: 45280, description: 'Odômetro final (km)' })
    @IsInt()
    @Min(0)
    endOdometer: number;

    @ApiProperty({ example: '-23.5489,-46.6388', description: 'Localização final (lat,lng)', required: false })
    @IsString()
    @IsOptional()
    endLocation?: string;

    @ApiProperty({ example: 50.0, description: 'Distância real percorrida (km)', required: false })
    @IsNumber()
    @IsOptional()
    actualDistanceKm?: number;
}
