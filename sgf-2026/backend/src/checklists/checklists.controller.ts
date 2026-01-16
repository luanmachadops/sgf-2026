import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ChecklistsService } from './checklists.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { Checklist, ChecklistType } from './checklist.entity';

@ApiTags('checklists')
@Controller('checklists')
export class ChecklistsController {
    constructor(private readonly checklistsService: ChecklistsService) { }

    @Get('templates')
    @ApiOperation({ summary: 'Get checklist template items' })
    @ApiResponse({ status: 200, description: 'Return checklist template.' })
    getTemplate(@Query('vehicleType') vehicleType?: string) {
        return this.checklistsService.getChecklistTemplate(vehicleType);
    }

    @Post()
    @ApiOperation({ summary: 'Submit a completed checklist' })
    @ApiResponse({ status: 201, description: 'Checklist submitted successfully.', type: Checklist })
    @ApiResponse({ status: 400, description: 'Critical issues block trip start.' })
    create(@Body() createChecklistDto: CreateChecklistDto) {
        return this.checklistsService.create(createChecklistDto);
    }

    @Post('validate')
    @ApiOperation({ summary: 'Validate checklist without saving' })
    @ApiResponse({ status: 200, description: 'Validation result.' })
    validate(@Body() createChecklistDto: CreateChecklistDto) {
        return this.checklistsService.validateChecklist(createChecklistDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all checklists' })
    @ApiQuery({ name: 'vehicleId', required: false })
    @ApiQuery({ name: 'driverId', required: false })
    @ApiQuery({ name: 'type', required: false, enum: ChecklistType })
    @ApiQuery({ name: 'hasIssues', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'Return all checklists.', type: [Checklist] })
    findAll(
        @Query('vehicleId') vehicleId?: string,
        @Query('driverId') driverId?: string,
        @Query('type') type?: ChecklistType,
        @Query('hasIssues') hasIssues?: string,
    ) {
        return this.checklistsService.findAll({
            vehicleId,
            driverId,
            type,
            hasIssues: hasIssues === 'true' ? true : hasIssues === 'false' ? false : undefined,
        });
    }

    @Get('issues')
    @ApiOperation({ summary: 'List checklists with issues' })
    @ApiResponse({ status: 200, description: 'Return checklists with issues.', type: [Checklist] })
    findWithIssues() {
        return this.checklistsService.findWithIssues();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a checklist by ID' })
    @ApiResponse({ status: 200, description: 'Return the checklist.', type: Checklist })
    @ApiResponse({ status: 404, description: 'Checklist not found.' })
    findOne(@Param('id') id: string) {
        return this.checklistsService.findOne(id);
    }

    @Get('trip/:tripId')
    @ApiOperation({ summary: 'Get checklists for a trip' })
    @ApiResponse({ status: 200, description: 'Return checklists for the trip.', type: [Checklist] })
    findByTrip(@Param('tripId') tripId: string) {
        return this.checklistsService.findByTrip(tripId);
    }
}
