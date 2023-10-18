import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppConstant } from '../../../utils/app.constants';
import { AppUtils } from '../../../utils/app.utils';
import { Vehicle, VehicleDocument } from '../schemas/vehicle.schema';
import { AutoIncrementService } from '../../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../../auto-increment/auto-increment.enum';
import { VehicleDto } from '../dto/vehicle.dto';
import { User } from '../../users/schemas/user.schema';
import { ItemLocation } from 'src/enums/item-location.enum';

@Injectable()
export class VehicleService {
    constructor(
        @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Vehicle
    async queryVehicle(filter: any) {
        const vehicle = await this.vehicleModel.findOne(filter).exec();
        return vehicle;
    }

    // Add Vehicle
    async addVehicle(vehicleDto: VehicleDto, loggedInUser: User) {

        // Check for Vehicle
        const vehiclecheck = await this.vehicleModel
            .findOne({ vehicle_number: vehicleDto.vehicle_number, status: 1 })
            .exec();
        if (vehiclecheck) {
            throw new BadRequestException('Vehicle already exists');
        }
        // Create Vehicle Id
        const vehicle_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.VEHICLE,
        );
        const vehicle = new Vehicle();
        vehicle.vehicle_id = vehicle_id;
        vehicle.vehicle_number = vehicleDto.vehicle_number;
        vehicle.owner_name = vehicleDto.owner_name;
        vehicle.company_id = vehicleDto.company_id;
        vehicle.engine_number = vehicleDto.engine_number;
        vehicle.chasis_number = vehicleDto.chasis_number;
        vehicle.maker_class = vehicleDto.maker_class;
        vehicle.vehicle_class = vehicleDto.vehicle_class;
        vehicle.body_type = vehicleDto.body_type;
        vehicle.fuel_used = vehicleDto.fuel_used;
        vehicle.cubic_capacity = vehicleDto.cubic_capacity;
        vehicle.storage_capacity = vehicleDto.storage_capacity;
        vehicle.manufacturing_date = vehicleDto.manufacturing_date;
        vehicle.registration_date = vehicleDto.registration_date;
        vehicle.valid_upto = vehicleDto.valid_upto;
        vehicle.created_at = AppUtils.getIsoUtcMoment();
        vehicle.updated_at = AppUtils.getIsoUtcMoment();
        vehicle.created_by = loggedInUser.user_id;
        vehicle.updated_by = loggedInUser.user_id;
        try {
            await this.vehicleModel.create(vehicle);
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.LOCATION);
            return { status: false, data: e };
        }
    }

    // GET All Vehicle
    async getVehicles(
        loggedInUser: User,
        company_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { company_id: company_id, status: 1 };
        if (search) {
            params.vehicle_number = { $regex: search };
        }
        const count = await this.vehicleModel.count(params).exec();
        const list = await this.vehicleModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Vehicle by Id
    async getVehicleById(id: string, loggedInUser: User) {
        const vehicle = await this.vehicleModel
            .findOne({ vehicle_id: id })
            .exec();
        return vehicle;
    }

    // Update Vehicle by Id
    async updateVehicle(
        vehicle_id: string,
        vehicleDto: VehicleDto,
        loggedInUser: User,
    ) {
        const vehicle = await this.vehicleModel.findOne({ vehicle_id }).exec();
        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }
        vehicle.vehicle_number = vehicleDto.vehicle_number;
        vehicle.owner_name = vehicleDto.owner_name;
        vehicle.company_id = vehicleDto.company_id;
        vehicle.engine_number = vehicleDto.engine_number;
        vehicle.chasis_number = vehicleDto.chasis_number;
        vehicle.maker_class = vehicleDto.maker_class;
        vehicle.vehicle_class = vehicleDto.vehicle_class;
        vehicle.body_type = vehicleDto.body_type;
        vehicle.fuel_used = vehicleDto.fuel_used;
        vehicle.cubic_capacity = vehicleDto.cubic_capacity;
        vehicle.storage_capacity = vehicleDto.storage_capacity;
        vehicle.manufacturing_date = vehicleDto.manufacturing_date;
        vehicle.registration_date = vehicleDto.registration_date;
        vehicle.valid_upto = vehicleDto.valid_upto;
        vehicle.updated_at = AppUtils.getIsoUtcMoment();
        vehicle.updated_by = loggedInUser.user_id;
        return this.vehicleModel.updateOne({ vehicle_id }, vehicle);
    }


    // Delete Vehicle by Id
    async deleteVehicle(vehicle_id: string, loggedInUser: User) {
        const vehicle = await this.vehicleModel.findOne({ vehicle_id }).exec();
        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }
        await this.vehicleModel.updateOne({ vehicle_id }, { status: 0 });
        return;
    }

    // Restore Vehicle by Id
    async restoreVehicle(vehicle_id: string, loggedInUser: User) {
        const vehicle = await this.vehicleModel.findOne({ vehicle_id }).exec();
        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }
        await this.vehicleModel.updateOne({ vehicle_id }, { status: 1 });
        return;
    }

}
