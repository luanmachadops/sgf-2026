import { Module } from '@nestjs/common';
import { RefuelingsController } from './refuelings.controller';
import { RefuelingsService } from './refuelings.service';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
    imports: [VehiclesModule],
    controllers: [RefuelingsController],
    providers: [RefuelingsService],
    exports: [RefuelingsService],
})
export class RefuelingsModule { }
