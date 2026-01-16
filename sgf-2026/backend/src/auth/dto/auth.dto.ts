import { IsString, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDriverDto {
    @ApiProperty({ example: '12345678901', description: 'CPF do motorista (apenas números)' })
    @IsString()
    @Length(11, 11)
    cpf: string;

    @ApiProperty({ example: 'senha123', description: 'Senha de acesso' })
    @IsString()
    password: string;
}

export class LoginUserDto {
    @ApiProperty({ example: 'gestor@prefeitura.sp.gov.br', description: 'Email institucional' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'senhaSegura123', description: 'Senha de acesso' })
    @IsString()
    password: string;
}

export class AuthResponseDto {
    @ApiProperty({ description: 'JWT Access Token' })
    accessToken: string;

    @ApiProperty({ description: 'Tipo de usuário (driver ou user)' })
    userType: 'driver' | 'user';

    @ApiProperty({ description: 'ID do usuário/motorista' })
    userId: string;

    @ApiProperty({ description: 'Nome do usuário/motorista' })
    name: string;

    @ApiProperty({ description: 'Role (apenas para users)', required: false })
    role?: string;
}

export class RefreshTokenDto {
    @ApiProperty({ description: 'Refresh Token' })
    @IsString()
    refreshToken: string;
}
