import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class DriverAccessDto {
    @ApiProperty({ example: 'senha123', description: 'Senha inicial ou redefinida do motorista' })
    @IsString()
    @Length(6, 20)
    password: string;
}
