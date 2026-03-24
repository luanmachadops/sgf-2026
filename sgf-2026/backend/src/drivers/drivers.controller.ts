import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverAccessDto } from './dto/driver-access.dto';
import { Driver } from './driver.entity';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
    constructor(private readonly driversService: DriversService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new driver' })
    @ApiResponse({ status: 201, description: 'The driver has been successfully created.', type: Driver })
    @ApiResponse({ status: 409, description: 'Driver with this CPF already exists.' })
    create(@Body() createDriverDto: CreateDriverDto) {
        return this.driversService.create(createDriverDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all drivers' })
    @ApiResponse({ status: 200, description: 'Return all drivers.', type: [Driver] })
    findAll() {
        return this.driversService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a driver by ID' })
    @ApiResponse({ status: 200, description: 'Return the driver.', type: Driver })
    @ApiResponse({ status: 404, description: 'Driver not found.' })
    findOne(@Param('id') id: string) {
        return this.driversService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a driver' })
    @ApiResponse({ status: 200, description: 'The driver has been successfully updated.', type: Driver })
    @ApiResponse({ status: 404, description: 'Driver not found.' })
    update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
        return this.driversService.update(id, updateDriverDto);
    }

    @Post(':id/provision-access')
    @ApiOperation({ summary: 'Provision access for an existing driver without login' })
    provisionAccess(@Param('id') id: string, @Body() accessDto: DriverAccessDto) {
        return this.driversService.provisionAccess(id, accessDto);
    }

    @Post(':id/reset-password')
    @ApiOperation({ summary: 'Reset password for an existing driver' })
    resetPassword(@Param('id') id: string, @Body() accessDto: DriverAccessDto) {
        return this.driversService.resetPassword(id, accessDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deactivate a driver' })
    @ApiResponse({ status: 204, description: 'The driver has been successfully deactivated.' })
    @ApiResponse({ status: 404, description: 'Driver not found.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.driversService.remove(id);
    }
}
