import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './drivers/drivers.module';
import { TripsModule } from './trips/trips.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { RefuelingsModule } from './refuelings/refuelings.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            useClass: DatabaseConfig,
        }),
        VehiclesModule,

        DriversModule,
        TripsModule,
        ChecklistsModule,
        RefuelingsModule,
        AuthModule,
        // TODO: Adicionar outros módulos:
        // TripsModule,
        // RefuelingsModule,
        // MaintenancesModule,
        // ChecklistsModule,
        // DashboardModule,
        // AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
