import { IsString, IsEnum, IsOptional, IsUUID, IsEmail, Length, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DriverStatus } from '../driver.entity';

export class CreateDriverDto {
    @ApiProperty({ example: '12345678901', description: 'CPF do motorista (apenas números)' })
    @IsString()
    @Length(11, 11)
    cpf: string;

    @ApiProperty({ example: 'João da Silva', description: 'Nome completo do motorista' })
    @IsString()
    name: string;

    @ApiProperty({ example: '12345', description: 'Matrícula do motorista' })
    @IsString()
    registrationNumber: string;

    @ApiProperty({ example: '12345678901', description: 'Número da CNH' })
    @IsString()
    cnhNumber: string;

    @ApiProperty({ example: 'AB', description: 'Categoria da CNH' })
    @IsString()
    cnhCategory: string;

    @ApiProperty({ example: '2028-12-31', description: 'Data de validade da CNH' })
    @IsDateString()
    cnhExpiryDate: Date;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'ID da secretaria', required: false })
    @IsUUID()
    @IsOptional()
    departmentId?: string;

    @ApiProperty({ example: '11999887766', description: 'Telefone de contato', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'joao.silva@prefeitura.sp.gov.br', description: 'Email para login', required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ enum: DriverStatus, example: DriverStatus.ACTIVE, required: false })
    @IsEnum(DriverStatus)
    @IsOptional()
    status?: DriverStatus;

    @ApiProperty({ example: 'senha123', description: 'Senha de acesso' })
    @IsString()
    @Length(6, 20)
    password: string;
}
