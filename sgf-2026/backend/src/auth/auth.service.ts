import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Driver, DriverStatus } from '../drivers/driver.entity';
import { User, UserRole } from '../users/user.entity';
import { LoginDriverDto, LoginUserDto, AuthResponseDto } from './dto/auth.dto';

export interface JwtPayload {
    sub: string;
    type: 'driver' | 'user';
    role?: UserRole;
    cpf?: string;
    email?: string;
}

@Injectable()
export class AuthService {
    private readonly MAX_LOGIN_ATTEMPTS = 3;
    private loginAttempts: Map<string, { count: number; lockedUntil?: Date }> = new Map();

    constructor(
        @InjectRepository(Driver)
        private readonly driverRepository: Repository<Driver>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    // RF-001: Login do Motorista (CPF + Senha)
    async loginDriver(loginDto: LoginDriverDto): Promise<AuthResponseDto> {
        const lockKey = `driver:${loginDto.cpf}`;
        this.checkLockout(lockKey);

        const driver = await this.driverRepository.findOne({
            where: { cpf: loginDto.cpf },
        });

        if (!driver) {
            this.recordFailedAttempt(lockKey);
            throw new UnauthorizedException('Invalid credentials');
        }

        if (driver.status !== DriverStatus.ACTIVE) {
            throw new UnauthorizedException('Driver account is not active');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, driver.passwordHash);
        if (!isPasswordValid) {
            this.recordFailedAttempt(lockKey);
            throw new UnauthorizedException('Invalid credentials');
        }

        // Limpar tentativas após login bem-sucedido
        this.loginAttempts.delete(lockKey);

        const payload: JwtPayload = {
            sub: driver.id,
            type: 'driver',
            cpf: driver.cpf,
        };

        return {
            accessToken: this.jwtService.sign(payload),
            userType: 'driver',
            userId: driver.id,
            name: driver.name,
        };
    }

    // RF-002: Login do Gestor (Email + Senha)
    async loginUser(loginDto: LoginUserDto): Promise<AuthResponseDto> {
        const lockKey = `user:${loginDto.email}`;
        this.checkLockout(lockKey);

        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
        });

        if (!user) {
            this.recordFailedAttempt(lockKey);
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
            this.recordFailedAttempt(lockKey);
            throw new UnauthorizedException('Invalid credentials');
        }

        this.loginAttempts.delete(lockKey);

        const payload: JwtPayload = {
            sub: user.id,
            type: 'user',
            role: user.role,
            email: user.email,
        };

        return {
            accessToken: this.jwtService.sign(payload),
            userType: 'user',
            userId: user.id,
            name: user.name,
            role: user.role,
        };
    }

    async validateToken(token: string): Promise<JwtPayload> {
        try {
            return this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async getProfile(userId: string, userType: 'driver' | 'user'): Promise<any> {
        if (userType === 'driver') {
            const driver = await this.driverRepository.findOne({
                where: { id: userId },
                relations: ['department'],
            });
            if (!driver) throw new UnauthorizedException('Driver not found');
            const { passwordHash, ...profile } = driver;
            return profile;
        } else {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['department'],
            });
            if (!user) throw new UnauthorizedException('User not found');
            const { passwordHash, ...profile } = user;
            return profile;
        }
    }

    private checkLockout(key: string): void {
        const attempts = this.loginAttempts.get(key);
        if (attempts?.lockedUntil && attempts.lockedUntil > new Date()) {
            const remainingMinutes = Math.ceil((attempts.lockedUntil.getTime() - Date.now()) / 60000);
            throw new UnauthorizedException(
                `Account locked. Try again in ${remainingMinutes} minutes.`
            );
        }
    }

    private recordFailedAttempt(key: string): void {
        const attempts = this.loginAttempts.get(key) || { count: 0 };
        attempts.count++;

        if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
            // Bloquear por 15 minutos (RF-001)
            attempts.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        }

        this.loginAttempts.set(key, attempts);
    }
}
