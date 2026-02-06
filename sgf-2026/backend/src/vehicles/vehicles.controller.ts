import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { Vehicle, VehicleStatus } from './vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@ApiTags('vehicles')
@Controller('vehicles')
// @ApiBearerAuth() // Uncomment when auth is implemented
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos os veículos' })
    @ApiResponse({ status: 200, description: 'Lista de veículos retornada com sucesso' })
    async findAll(
        @Query('status') status?: VehicleStatus,
        @Query('departmentId') departmentId?: string,
    ): Promise<Vehicle[]> {
        return this.vehiclesService.findAll({ status, departmentId });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar veículo por ID' })
    @ApiResponse({ status: 200, description: 'Veículo encontrado' })
    @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
    async findOne(@Param('id') id: string): Promise<Vehicle> {
        return this.vehiclesService.findOne(id);
    }

    @Get('plate/:plate')
    @ApiOperation({ summary: 'Buscar veículo por placa' })
    @ApiResponse({ status: 200, description: 'Veículo encontrado' })
    @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
    async findByPlate(@Param('plate') plate: string): Promise<Vehicle> {
        return this.vehiclesService.findByPlate(plate);
    }

    @Post('scan')
    @ApiOperation({ summary: 'Buscar veículo por QR Code' })
    @ApiResponse({ status: 200, description: 'Veículo encontrado' })
    @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
    async scanQrCode(@Body('qrCodeHash') qrCodeHash: string): Promise<Vehicle> {
        return this.vehiclesService.findByQrCode(qrCodeHash);
    }

    @Post()
    @ApiOperation({ summary: 'Criar novo veículo' })
    @ApiResponse({ status: 201, description: 'Veículo criado com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    async create(@Body() createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
        return this.vehiclesService.create(createVehicleDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar veículo' })
    @ApiResponse({ status: 200, description: 'Veículo atualizado com sucesso' })
    @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
    async update(
        @Param('id') id: string,
        @Body() updateVehicleDto: UpdateVehicleDto,
    ): Promise<Vehicle> {
        return this.vehiclesService.update(id, updateVehicleDto);
    }

    @Put(':id/status')
    @ApiOperation({ summary: 'Atualizar status do veículo' })
    @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: VehicleStatus,
    ): Promise<Vehicle> {
        return this.vehiclesService.updateStatus(id, status);
    }

    @Put(':id/odometer')
    @ApiOperation({ summary: 'Atualizar odômetro do veículo' })
    @ApiResponse({ status: 200, description: 'Odômetro atualizado com sucesso' })
    async updateOdometer(
        @Param('id') id: string,
        @Body('odometer') odometer: number,
    ): Promise<Vehicle> {
        return this.vehiclesService.updateOdometer(id, odometer);
    }

    @Patch(':id/photo')
    @ApiOperation({ summary: 'Atualizar foto do veículo' })
    @ApiResponse({ status: 200, description: 'Foto atualizada com sucesso' })
    async updatePhoto(
        @Param('id') id: string,
        @Body('photoUrl') photoUrl: string,
    ): Promise<Vehicle> {
        return this.vehiclesService.updatePhoto(id, photoUrl);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remover veículo' })
    @ApiResponse({ status: 204, description: 'Veículo removido com sucesso' })
    @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
    async remove(@Param('id') id: string): Promise<void> {
        return this.vehiclesService.remove(id);
    }
}
