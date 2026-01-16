import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistsService } from './checklists.service';
import { ChecklistsController } from './checklists.controller';
import { Checklist } from './checklist.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Checklist])],
    controllers: [ChecklistsController],
    providers: [ChecklistsService],
    exports: [ChecklistsService],
})
export class ChecklistsModule { }
