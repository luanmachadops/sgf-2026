import { Controller, Get, Post, Put, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { StartTripDto } from './dto/start-trip.dto';
import { FinishTripDto } from './dto/finish-trip.dto';
import { Trip, TripStatus } from './trip.entity';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
    constructor(private readonly tripsService: TripsService) { }

    @Post('start')
    @ApiOperation({ summary: 'Start a new trip' })
    @ApiResponse({ status: 201, description: 'Trip started successfully.', type: Trip })
    @ApiResponse({ status: 400, description: 'Vehicle not available or already has active trip.' })
    startTrip(@Body() startTripDto: StartTripDto) {
        return this.tripsService.startTrip(startTripDto);
    }

    @Put(':id/finish')
    @ApiOperation({ summary: 'Finish an ongoing trip' })
    @ApiResponse({ status: 200, description: 'Trip finished successfully.', type: Trip })
    @ApiResponse({ status: 400, description: 'Trip is not in progress or invalid data.' })
    @ApiResponse({ status: 404, description: 'Trip not found.' })
    finishTrip(@Param('id') id: string, @Body() finishTripDto: FinishTripDto) {
        return this.tripsService.finishTrip(id, finishTripDto);
    }

    @Put(':id/cancel')
    @ApiOperation({ summary: 'Cancel an ongoing trip' })
    @ApiResponse({ status: 200, description: 'Trip cancelled successfully.', type: Trip })
    @ApiResponse({ status: 400, description: 'Trip is not in progress.' })
    @ApiResponse({ status: 404, description: 'Trip not found.' })
    cancelTrip(@Param('id') id: string) {
        return this.tripsService.cancelTrip(id);
    }

    @Get()
    @ApiOperation({ summary: 'List all trips' })
    @ApiQuery({ name: 'vehicleId', required: false })
    @ApiQuery({ name: 'driverId', required: false })
    @ApiQuery({ name: 'status', required: false, enum: TripStatus })
    @ApiResponse({ status: 200, description: 'Return all trips.', type: [Trip] })
    findAll(
        @Query('vehicleId') vehicleId?: string,
        @Query('driverId') driverId?: string,
        @Query('status') status?: TripStatus,
    ) {
        return this.tripsService.findAll({ vehicleId, driverId, status });
    }

    @Get('anomalies')
    @ApiOperation({ summary: 'List trips with anomalies' })
    @ApiResponse({ status: 200, description: 'Return trips with anomalies.', type: [Trip] })
    findAnomalies() {
        return this.tripsService.findAnomalies();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a trip by ID' })
    @ApiResponse({ status: 200, description: 'Return the trip.', type: Trip })
    @ApiResponse({ status: 404, description: 'Trip not found.' })
    findOne(@Param('id') id: string) {
        return this.tripsService.findOne(id);
    }
}
