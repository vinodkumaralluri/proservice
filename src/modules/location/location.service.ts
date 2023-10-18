import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppConstant } from '../../utils/app.constants';
import { AppUtils } from '../../utils/app.utils';
import { Location, LocationDocument } from './schemas/location.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { LocationDto } from './dto/location.dto';
import { User } from '../users/schemas/user.schema';
import { EntityType } from 'src/enums/entity-type.enum';

@Injectable()
export class LocationService {
    constructor(
        @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Location
    async queryLocation(filter: any) {
        const location = await this.locationModel.findOne(filter).exec();
        return location;
    }

    // Add Location
    async addLocation(locationDto: LocationDto, loggedInUser: string) {

        // Check for Location
        const locationcheck = await this.locationModel
            .findOne({ latitude: locationDto.latitude, longitude: locationDto.longitude, status: 1 })
            .exec();
        if (locationcheck) {
            throw new BadRequestException('Location already exists');
        }
        // Create Location Id
        const location_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.LOCATION,
        );
        const location = new Location();
        location.location_id = location_id;
        location.latitude = locationDto.latitude;
        location.longitude = locationDto.longitude;
        location.location_type = locationDto.location_type;
        location.created_at = AppUtils.getIsoUtcMoment();
        location.updated_at = AppUtils.getIsoUtcMoment();
        location.created_by = loggedInUser;
        location.updated_by = loggedInUser;
        try {
            await this.locationModel.create(location);
            return { status: true, data: location_id };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.LOCATION);
            return { status: false, data: e };
        }
    }

    // GET All Locations
    async getLocations(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        // if (search) {
        //     params.task = { $regex: search };
        // }
        const count = await this.locationModel.count(params).exec();
        const list = await this.locationModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Location by Id
    async getLocationById(id: string, loggedInUser: User) {
        const location = await this.locationModel
            .findOne({ location_id: id })
            .exec();
        return location;
    }

    // Update Location by Id
    async updateLocation(
        location_id: string,
        locationDto: LocationDto,
        loggedInUser: User,
    ) {
        const location = await this.locationModel.findOne({ location_id }).exec();
        if (!location) {
            throw new NotFoundException('Location not found');
        }
        location.latitude = locationDto.latitude;
        location.longitude = locationDto.longitude;
        location.location_type = locationDto.location_type;
        location.updated_at = AppUtils.getIsoUtcMoment();
        location.updated_by = loggedInUser.user_id;
        return this.locationModel.updateOne({ location_id }, location);
    }


    // Delete Location by Id
    async deleteLocation(location_id: string, loggedInUser: User) {
        const location = await this.locationModel.findOne({ location_id }).exec();
        if (!location) {
            throw new NotFoundException('Location not found');
        }
        await this.locationModel.updateOne({ location_id }, { status: 0 });
        return;
    }

    // Restore Location by Id
    async restoreLocation(location_id: string, loggedInUser: User) {
        const location = await this.locationModel.findOne({ location_id }).exec();
        if (!location) {
            throw new NotFoundException('Location not found');
        }
        await this.locationModel.updateOne({ location_id }, { status: 1 });
        return;
    }

}

