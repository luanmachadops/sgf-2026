import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Driver, DriverStatus } from './driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
    constructor(
        @InjectRepository(Driver)
        private readonly driverRepository: Repository<Driver>,
    ) { }

    async create(createDriverDto: CreateDriverDto): Promise<Driver> {
        const existingDriver = await this.driverRepository.findOne({
            where: { cpf: createDriverDto.cpf },
        });

        if (existingDriver) {
            throw new ConflictException('Driver with this CPF already exists');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(createDriverDto.password, salt);

        const driver = this.driverRepository.create({
            ...createDriverDto,
            passwordHash,
        });

        return this.driverRepository.save(driver);
    }

    async findAll(): Promise<Driver[]> {
        return this.driverRepository.find({
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Driver> {
        const driver = await this.driverRepository.findOne({
            where: { id },
            relations: ['department'],
        });

        if (!driver) {
            throw new NotFoundException(`Driver with ID ${id} not found`);
        }

        return driver;
    }

    async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
        const driver = await this.findOne(id);

        if (updateDriverDto.password) {
            const salt = await bcrypt.genSalt();
            updateDriverDto['passwordHash'] = await bcrypt.hash(updateDriverDto.password, salt);
            delete updateDriverDto.password;
        }

        this.driverRepository.merge(driver, updateDriverDto);
        return this.driverRepository.save(driver);
    }

    async remove(id: string): Promise<void> {
        const driver = await this.findOne(id);
        // Soft delete or status change is likely better, but strictly following CRUD for now
        // Usually we just set status to INACTIVE
        driver.status = DriverStatus.INACTIVE;
        await this.driverRepository.save(driver);
    }

    async findByCpf(cpf: string): Promise<Driver | null> {
        return this.driverRepository.findOne({ where: { cpf } });
    }
}
