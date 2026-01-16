import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefuelingsService } from './refuelings.service';
import { RefuelingsController } from './refuelings.controller';
import { Refueling } from './refueling.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Refueling]),
        VehiclesModule, // Para validação anti-fraude
    ],
    controllers: [RefuelingsController],
    providers: [RefuelingsService],
    exports: [RefuelingsService],
})
export class RefuelingsModule { }
