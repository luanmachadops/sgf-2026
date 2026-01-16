import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
    constructor(private configService: ConfigService) { }

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            url: this.configService.get('DATABASE_URL'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: false, // IMPORTANTE: false em produção, usamos migrações
            logging: this.configService.get('NODE_ENV') === 'development',
            ssl: {
                rejectUnauthorized: false,
            },
        };
    }
}
