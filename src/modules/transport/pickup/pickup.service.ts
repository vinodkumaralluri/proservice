import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueueHandler } from 'src/enums/queue-handler.enum';
import * as mongoose from 'mongoose';
import { AppConstant } from '../../../utils/app.constants';
import { AppUtils } from '../../../utils/app.utils';
import { Pickup, PickupDocument } from '../schemas/pickup.schema';
import { Item, ItemDocument } from 'src/modules/item/schemas/item.schema';
import { AutoIncrementService } from '../../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../../auto-increment/auto-increment.enum';
import { PickupDto } from '../dto/pickup.dto';
import { User } from '../../users/schemas/user.schema';
import { ItemLocation } from 'src/enums/item-location.enum';
import { LocationDto } from '../../location/dto/location.dto';
import { LocationType } from 'src/enums/entity-type.enum';
import { LocationService } from '../../location/location.service';
import { CustomerService } from 'src/modules/customer/customer.service';
import { PickupStatus } from 'src/enums/pickup-status.enum';
import { Operation } from 'src/enums/operation.enum';

@Injectable()
export class PickupService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectQueue('item') private itemQueue: Queue,
        @InjectModel(Pickup.name) private pickupModel: Model<PickupDocument>,
        @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
        private autoIncrementService: AutoIncrementService,
        private locationService: LocationService,
        private customerService: CustomerService,
    ) { }

    // Query Pickup
    async queryPickup(filter: any) {
        const pickup = await this.pickupModel.findOne(filter).exec();
        return pickup;
    }

    // Add Pickup
    async addPickup(pickupDto: PickupDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Create Pickup Id
        const pickup_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.PICKUP,
            transactionSession,
        );
        const pickup = new Pickup();
        pickup.pickup_id = pickup_id;
        pickup.destination_type = pickupDto.destination_type;
        pickup.location_id = pickupDto.location_id;
        pickup.pickup_person = pickupDto.pickup_person;
        pickup.vehicle_id = pickupDto.vehicle_id;
        pickup.created_at = AppUtils.getIsoUtcMoment();
        pickup.updated_at = AppUtils.getIsoUtcMoment();
        pickup.created_by = loggedInUser.user_id;
        pickup.updated_by = loggedInUser.user_id;
        try {
            await this.pickupModel.create([pickup], { transactionSession });
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }
    }

    // GET All Pickups
    async getPickups(
        loggedInUser: User,
        user_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        let params = { user_id: user_id, status: 1 }
        const count = await this.pickupModel.count(params).exec();
        const list = await this.pickupModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Pickup by Id
    async getPickupById(id: string, loggedInUser: User) {
        const pickup = await this.pickupModel
            .findOne({ pickup_id: id })
            .exec();
        return pickup;
    }

    // Update Pickup by Id
    async updatePickup(
        pickup_id: string,
        pickupDto: PickupDto,
        loggedInUser: User,
    ) {
        const pickup = await this.pickupModel.findOne({ pickup_id }).exec();
        if (!pickup) {
            throw new NotFoundException('Pickup not found');
        }
        pickup.destination_type = pickupDto.destination_type;
        pickup.location_id = pickupDto.location_id;
        pickup.pickup_person = pickupDto.pickup_person;
        pickup.vehicle_id = pickupDto.vehicle_id;
        pickup.updated_at = AppUtils.getIsoUtcMoment();
        pickup.updated_by = loggedInUser.user_id;
        await this.pickupModel.updateOne({ pickup_id }, pickup);
        return;
    }

    async updatePickupLiveLocation(
        pickup_id: string,
        locationdto: LocationDto,
        loggedInUser: User,
    ) {
        const pickup = await this.pickupModel.findOne({ pickup_id }).exec();
        if (!pickup) {
            throw new NotFoundException('Pickup not found');
        }
        let live_location = [];
        live_location.push(locationdto.latitude);
        live_location.push(locationdto.longitude);
        await this.pickupModel.updateOne({ pickup_id }, { live_location: live_location });
        return;
    }

    // Start Pickup
    async startPickup(
        pickup_id: string,
        loggedInUser: string,
    ) {
        const pickup = await this.pickupModel.findOne({ pickup_id }).exec();
        if (!pickup) {
            throw new NotFoundException('Pick Up not found');
        }
        await this.pickupModel.updateOne(
            { pickup_id: pickup_id },
            { $set: { started_at: AppUtils.getIsoUtcMoment(), updated_at: AppUtils.getIsoUtcMoment(), updated_by: loggedInUser } }
        )
        return;
    }

    // Add Item to Pickup
    async addItemToPickup(
        pickup_id: string,
        pickupitemdto: any,
        loggedInUser: string,
    ) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const pickup = await this.pickupModel.findOne({ pickup_id }).exec();
        if (!pickup) {
            throw new NotFoundException('Pick Up not found');
        }
        let pickupitem: any;
        pickupitem.item_id = pickupitemdto.item_id;
        pickupitem.customer_id = pickupitemdto.customer_id;
        pickupitem.location_id = pickupitemdto.location_id;
        pickupitem.pickup_status = PickupStatus.Pending;
        // Check for the Pickup location id
        if (!pickupitemdto.location_id) {
            const locationdto = {
                latitude: pickupitemdto.latitude,
                longitude: pickupitemdto.longitude,
                location_type: LocationType.Customer,
            }
            const locationData = await this.locationService.addLocation(locationdto, loggedInUser);
            await this.customerService.addLocationToCustomer(locationData.data, pickupitemdto.customer_id);
            pickupitem.location_id = locationData.data;
        } else {
            pickupitem.location_id = pickupitemdto.location_id;
        }
        pickupitem.pickup_time = '';
        await this.pickupModel.updateOne([{ pickup_id }, { $push: { items: pickupitem }, $set: { updated_at: AppUtils.getIsoUtcMoment(), updated_by: loggedInUser } }], { transactionSession });
        // Add ItemBlock into the queue
        try {
            await this.itemQueue.add(QueueHandler.ITEM, {
                item_id: pickupitemdto.item_id,
                Operation: Operation.DELIVERY,
                source: LocationType.Customer,
                location_id: pickupitemdto.customer_id,
                destination: pickup.destination_type,
                destination_id: pickup.location_id,
                session: transactionSession,
            });
            await transactionSession.commitTransaction();
        } catch (err) {
            await transactionSession.abortTransaction();
            console.log('QUEUE failed to add', err);
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

    // Complete Item Pickup
    async completeItemPickup(
        pickup_id: string,
        pickupitemdto: any,
        loggedInUser: string,
    ) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const pickup = await this.pickupModel.findOne({ pickup_id }).exec();
        if (!pickup) {
            throw new NotFoundException('Pick Up not found');
        }
        const pickupitem: any = pickup.items.filter(data => data.item_id === pickupitemdto.item_id)[0];
        pickupitem.pickup_status = PickupStatus.PickedUp;
        pickupitem.pickup_time = pickupitemdto.time;
        await this.pickupModel.updateOne(
            [{ pickup_id: pickup_id, 'items.item_id': pickupitemdto.item_id },
            { $set: { 'items.$': pickupitem, updated_at: AppUtils.getIsoUtcMoment(), updated_by: loggedInUser } }],
            { transactionSession }
        )
        await this.itemModel.updateOne([{ item_id: pickupitemdto.item_id }, { $set: { item_location: ItemLocation.Pickup } }], { transactionSession });
        // Add ItemBlock into the queue
        try {
            await this.itemQueue.add(QueueHandler.ITEM, {
                item_id: pickupitemdto.item_id,
                Operation: Operation.DELIVERY,
                source: LocationType.Customer,
                location_id: pickupitemdto.customer_id,
                destination: pickup.destination_type,
                destination_id: pickup.location_id,
                session: transactionSession,
            });
            await transactionSession.commitTransaction();
        } catch (err) {
            await transactionSession.abortTransaction();
            console.log('QUEUE failed to add', err);
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

    // Complete Pickup
    async completePickup(
        pickup_id: string,
        loggedInUser: string,
    ) {
        const pickup = await this.pickupModel.findOne({ pickup_id }).exec();
        if (!pickup) {
            throw new NotFoundException('Pick Up not found');
        }
        await this.pickupModel.updateOne(
            { pickup_id: pickup_id },
            { $set: { ended_at: AppUtils.getIsoUtcMoment(), updated_at: AppUtils.getIsoUtcMoment(), updated_by: loggedInUser } }
        )

        const items = pickup.items;
        const destination = pickup.destination_type;
        for (let i = 0; i < items.length; i++) {
            await this.itemModel.updateOne({ item_id: items[i].item_id }, { $set: { item_location: destination } });
        }
        return;
    }

    // Delete Pickup by Id
    async deletePickup(pickup_id: string, loggedInUser: User) {
        const pickup = await this.pickupModel.findOne({ pickup_id }).exec();
        if (!pickup) {
            throw new NotFoundException('Pickup not found');
        }
        await this.pickupModel.updateOne({ pickup_id }, { status: 0 });
        return;
    }

    // Restore Pickup by Id
    async restorePickup(pickup_id: string, loggedInUser: User) {
        const pickup = await this.pickupModel.findOne({ pickup_id }).exec();
        if (!pickup) {
            throw new NotFoundException('Pickup not found');
        }
        await this.pickupModel.updateOne({ pickup_id }, { status: 1 });
        return;
    }

}
