import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
        VehiclesModule,
        DriversModule,
        TripsModule,
        ChecklistsModule,
        RefuelingsModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
