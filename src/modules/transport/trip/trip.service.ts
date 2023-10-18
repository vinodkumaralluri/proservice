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
import { Trip, TripDocument } from '../schemas/trip.schema';
import { Item, ItemDocument } from '../../item/schemas/item.schema';
import { AutoIncrementService } from '../../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../../auto-increment/auto-increment.enum';
import { TripDto } from '../dto/trip.dto';
import { LocationDto } from '../../location/dto/location.dto';
import { User } from '../../users/schemas/user.schema';
import { ItemLocation } from 'src/enums/item-location.enum';

@Injectable()
export class TripService {
    constructor(
        @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
        @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Trip
    async queryTrip(filter: any) {
        const trip = await this.tripModel.findOne(filter).exec();
        return trip;
    }

    // Add Trip
    async addTrip(tripDto: TripDto, loggedInUser: User) {

        // Create Trip Id
        const trip_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.TRIP,
        );
        const trip = new Trip();
        trip.trip_id = trip_id;
        trip.source_location = tripDto.source_location;
        trip.destination_location = tripDto.destination_location;
        trip.vehicle_id = tripDto.vehicle_id;
        trip.created_at = AppUtils.getIsoUtcMoment();
        trip.updated_at = AppUtils.getIsoUtcMoment();
        trip.created_by = loggedInUser.user_id;
        trip.updated_by = loggedInUser.user_id;
        try {
            await this.tripModel.create(trip);
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.TRIP);
            return { status: false, data: e };
        }
    }

    // GET All Trips
    async getTrips(
        loggedInUser: User,
        vehicle_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        let params;
        if (search) {
            params = {
                $or: [
                    { source_location: { $regex: search } },
                    { destination_location: { $regex: search } },
                ],
                status: 1,
            };
        }
        else {
            params = { status: 1 };
        }
        const count = await this.tripModel.count(params).exec();
        const list = await this.tripModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Trip by Id
    async getTripById(id: string, loggedInUser: User) {
        const trip = await this.tripModel
            .findOne({ trip_id: id })
            .exec();
        return trip;
    }

    // Update Trip by Id
    async updateTrip(
        trip_id: string,
        tripDto: TripDto,
        loggedInUser: User,
    ) {
        const trip = await this.tripModel.findOne({ trip_id }).exec();
        if (!trip) {
            throw new NotFoundException('Trip not found');
        }
        trip.source_location = tripDto.source_location;
        trip.destination_location = tripDto.destination_location;
        trip.updated_at = AppUtils.getIsoUtcMoment();
        trip.updated_by = loggedInUser.user_id;
        return this.tripModel.updateOne({ trip_id }, trip);
    }

    async updateLiveLocation(
        trip_id: string,
        locationdto: LocationDto,
        loggedInUser: User,
    ) {
        const trip = await this.tripModel.findOne({ trip_id }).exec();
        if (!trip) {
            throw new NotFoundException('Trip not found');
        }
        let live_location = [];
        live_location.push(locationdto.latitude);
        live_location.push(locationdto.longitude);
        return this.tripModel.updateOne({ trip_id }, {live_location: live_location});
    }

    async addItemToTrip(
        item_id: string,
        trip_id: string,
        loggedInUser: User,
    ) {
        const trip = await this.tripModel.findOne({ trip_id }).exec();
        if (!trip) {
            throw new NotFoundException('Trip not found');
        }
        let trip_items = trip.items;
        trip_items.push(item_id);
        await this.tripModel.updateOne({ trip_id }, {items: trip_items});
        return this.itemModel.updateOne({ item_id}, {item_status: ItemLocation.Transport});
    }

    // Delete Trip by Id
    async deleteTrip(trip_id: string, loggedInUser: User) {
        const trip = await this.tripModel.findOne({ trip_id }).exec();
        if (!trip) {
            throw new NotFoundException('Trip not found');
        }
        await this.tripModel.updateOne({ trip_id }, { status: 0 });
        return;
    }

    // Restore Trip by Id
    async restoreTrip(trip_id: string, loggedInUser: User) {
        const trip = await this.tripModel.findOne({ trip_id }).exec();
        if (!trip) {
            throw new NotFoundException('Trip not found');
        }
        await this.tripModel.updateOne({ trip_id }, { status: 1 });
        return;
    }

}








