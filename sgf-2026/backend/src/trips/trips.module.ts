import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { Trip } from './trip.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Trip]),
        VehiclesModule, // Importa para usar VehiclesService
    ],
    controllers: [TripsController],
    providers: [TripsService],
    exports: [TripsService],
})
export class TripsModule { }
