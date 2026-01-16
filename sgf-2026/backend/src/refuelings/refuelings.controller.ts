import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RefuelingsService } from './refuelings.service';
import { CreateRefuelingDto } from './dto/create-refueling.dto';
import { Refueling } from './refueling.entity';

@ApiTags('refuelings')
@Controller('refuelings')
export class RefuelingsController {
    constructor(private readonly refuelingsService: RefuelingsService) { }

    @Post()
    @ApiOperation({ summary: 'Register a new refueling' })
    @ApiResponse({ status: 201, description: 'Refueling registered successfully.', type: Refueling })
    @ApiResponse({ status: 400, description: 'Invalid data.' })
    create(@Body() createRefuelingDto: CreateRefuelingDto) {
        return this.refuelingsService.create(createRefuelingDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all refuelings' })
    @ApiQuery({ name: 'vehicleId', required: false })
    @ApiQuery({ name: 'driverId', required: false })
    @ApiQuery({ name: 'hasAnomaly', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'Return all refuelings.', type: [Refueling] })
    findAll(
        @Query('vehicleId') vehicleId?: string,
        @Query('driverId') driverId?: string,
        @Query('hasAnomaly') hasAnomaly?: string,
    ) {
        return this.refuelingsService.findAll({
            vehicleId,
            driverId,
            hasAnomaly: hasAnomaly === 'true' ? true : hasAnomaly === 'false' ? false : undefined,
        });
    }

    @Get('anomalies')
    @ApiOperation({ summary: 'List refuelings with anomalies' })
    @ApiResponse({ status: 200, description: 'Return refuelings with anomalies.', type: [Refueling] })
    findAnomalies() {
        return this.refuelingsService.findAnomalies();
    }

    @Get('vehicle/:vehicleId/stats')
    @ApiOperation({ summary: 'Get consumption statistics for a vehicle' })
    @ApiResponse({ status: 200, description: 'Return consumption stats.' })
    getVehicleStats(@Param('vehicleId') vehicleId: string) {
        return this.refuelingsService.getVehicleConsumptionStats(vehicleId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a refueling by ID' })
    @ApiResponse({ status: 200, description: 'Return the refueling.', type: Refueling })
    @ApiResponse({ status: 404, description: 'Refueling not found.' })
    findOne(@Param('id') id: string) {
        return this.refuelingsService.findOne(id);
    }

    @Put(':id/validate')
    @ApiOperation({ summary: 'Validate a refueling (manager approval)' })
    @ApiResponse({ status: 200, description: 'Refueling validated.', type: Refueling })
    @ApiResponse({ status: 404, description: 'Refueling not found.' })
    validate(@Param('id') id: string, @Body('validatorId') validatorId: string) {
        return this.refuelingsService.validateById(id, validatorId);
    }
}
