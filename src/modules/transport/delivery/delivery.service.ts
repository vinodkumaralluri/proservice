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
import { Delivery, DeliveryDocument } from '../schemas/delivery.schema';
import { Item, ItemDocument } from 'src/modules/item/schemas/item.schema';
import { Purchase, PurchaseDocument } from 'src/modules/purchase/schemas/purchase.schema';
import { AutoIncrementService } from '../../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../../auto-increment/auto-increment.enum';
import { DeliveryDto } from '../dto/delivery.dto';
import { User } from '../../users/schemas/user.schema';
import { ItemLocation } from 'src/enums/item-location.enum';
import { LocationDto } from '../../location/dto/location.dto';
import { DeliveryStatus } from 'src/enums/delivery-status.enum';
import { EntityType } from 'src/enums/entity-type.enum';
import { LocationService } from '../../location/location.service';
import { CustomerService } from 'src/modules/customer/customer.service';
import { Operation } from 'src/enums/operation.enum';

@Injectable()
export class DeliveryService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectQueue('item') private itemQueue: Queue,
        @InjectModel(Delivery.name) private deliveryModel: Model<DeliveryDocument>,
        @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
        @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
        private autoIncrementService: AutoIncrementService,
        private locationService: LocationService,
        private customerService: CustomerService,
    ) {
        itemQueue.on('error', (err) => {
            console.log('Error connecting to QUEUE', err);
        });
    }

    // Query Delivery
    async queryDelivery(filter: any) {
        const delivery = await this.deliveryModel.findOne(filter).exec();
        return delivery;
    }

    // Add Delivery
    async addDelivery(deliveryDto: DeliveryDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Create Delivery Id
        const delivery_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.DELIVERY,
            transactionSession,
        );
        const delivery = new Delivery();
        delivery.delivery_id = delivery_id;
        delivery.source_type = deliveryDto.source_type;
        delivery.location_id = deliveryDto.location_id;
        delivery.delivery_person = deliveryDto.delivery_person;
        delivery.vehicle_id = deliveryDto.vehicle_id;
        delivery.created_at = AppUtils.getIsoUtcMoment();
        delivery.updated_at = AppUtils.getIsoUtcMoment();
        delivery.created_by = loggedInUser.user_id;
        delivery.updated_by = loggedInUser.user_id;
        try {
            await this.deliveryModel.create([delivery], { transactionSession });
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }
    }

    // GET All Deliveries
    async getDeliveries(
        loggedInUser: User,
        user_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        let params = { user_id: user_id, status: 1 }
        const count = await this.deliveryModel.count(params).exec();
        const list = await this.deliveryModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Delivery by Id
    async getDeliveryById(id: string, loggedInUser: User) {
        const delivery = await this.deliveryModel
            .findOne({ delivery_id: id })
            .exec();
        return delivery;
    }

    // Update Delivery by Id
    async updateDelivery(
        delivery_id: string,
        deliveryDto: DeliveryDto,
        loggedInUser: User,
    ) {
        const delivery = await this.deliveryModel.findOne({ delivery_id }).exec();
        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }
        delivery.source_type = deliveryDto.source_type;
        delivery.location_id = deliveryDto.location_id;
        delivery.delivery_person = deliveryDto.delivery_person;
        delivery.vehicle_id = deliveryDto.vehicle_id;
        delivery.updated_at = AppUtils.getIsoUtcMoment();
        delivery.updated_by = loggedInUser.user_id;
        return this.deliveryModel.updateOne({ delivery_id }, delivery);
    }

    async updateLiveLocation(
        delivery_id: string,
        locationdto: LocationDto,
        loggedInUser: User,
    ) {
        const delivery = await this.deliveryModel.findOne({ delivery_id }).exec();
        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }
        let live_location = [];
        live_location.push(locationdto.latitude);
        live_location.push(locationdto.longitude);
        return this.deliveryModel.updateOne({ delivery_id }, { live_location: live_location });
    }

    // Start Delivery
    async startDelivery(
        delivery_id: string,
        loggedInUser: string,
    ) {
        const delivery = await this.deliveryModel.findOne({ delivery_id }).exec();
        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }
        await this.deliveryModel.updateOne(
            { delivery_id: delivery_id },
            { $set: { started_at: AppUtils.getIsoUtcMoment(), updated_at: AppUtils.getIsoUtcMoment(), updated_by: loggedInUser } }
        )
    }

    // Add Item to Delivery
    async addItemToDelivery(
        delivery_id: string,
        deliveryitemdto: any,
        loggedInUser: string,
    ) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const delivery = await this.deliveryModel.findOne({ delivery_id }).exec();
        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }
        let deliveryitem: any;
        deliveryitem.item_id = deliveryitemdto.item_id;
        deliveryitem.customer_id = deliveryitemdto.customer_id;
        deliveryitem.location_id = deliveryitemdto.location_id;
        deliveryitem.delivery_status = DeliveryStatus.Pending;
        // Check for the delivery location id
        if (!deliveryitemdto.location_id) {
            const locationdto = {
                latitude: deliveryitemdto.latitude,
                longitude: deliveryitemdto.longitude,
                location_type: EntityType.Customer,
            }
            const locationData = await this.locationService.addLocation(locationdto, loggedInUser);
            await this.customerService.addLocationToCustomer(locationData.data, deliveryitemdto.customer_id);
            deliveryitem.location_id = locationData.data;
        } else {
            deliveryitem.location_id = deliveryitemdto.location_id;
        }
        deliveryitem.delivery_time = '',
            await this.deliveryModel.updateOne([{ delivery_id }, { items: { $push: deliveryitem }, $set: { updated_at: AppUtils.getIsoUtcMoment(), updated_by: loggedInUser } }], { transactionSession });
        await this.itemModel.updateOne([{ item_id: deliveryitemdto.item_id }, { item_status: ItemLocation.Delivery }], { transactionSession });
        // Add ItemBlock into the queue
        try {
            await this.itemQueue.add(QueueHandler.ITEM, {
                item_id: deliveryitemdto.item_id,
                Operation: Operation.DELIVERY,
                source: delivery.source_type,
                location_id: delivery.location_id,
                destination: EntityType.Customer,
                destination_id: deliveryitemdto.customer_id,
                session: transactionSession,
            });
            await transactionSession.commitTransaction();
        } catch (err) {
            await transactionSession.abortTransaction();
            console.log('QUEUE failed to add', err);
        } finally {
            await transactionSession.endSession();
        }
    }

    // Complete Item Delivery
    async completeItemDelivery(
        delivery_id: string,
        deliveryitemdto: any,
        loggedInUser: string,
    ) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const delivery = await this.deliveryModel.findOne({ delivery_id }).exec();
        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }
        const deliveryitem: any = delivery.items.filter(data => data.item_id === deliveryitemdto.item_id)[0];
        deliveryitem.delivery_status = DeliveryStatus.Delivered;
        deliveryitem.delivery_time = deliveryitemdto.time;
        await this.deliveryModel.updateOne(
            [{ delivery_id: delivery_id, 'items.item_id': deliveryitemdto.item_id },
            { $set: { 'items.$': deliveryitem, updated_at: AppUtils.getIsoUtcMoment(), updated_by: loggedInUser } }],
            { transactionSession }
        )
        await this.itemModel.updateOne([{ item_id: deliveryitemdto.item_id }, { $set: { item_location: ItemLocation.Customer } }], { transactionSession });
        await this.purchaseModel.updateOne([{ item_id: deliveryitemdto.item_id }, { $set: { delivery_status: DeliveryStatus.Delivered } }], { transactionSession });
        // Add ItemBlock into the queue
        try {
            await this.itemQueue.add(QueueHandler.ITEM, {
                item_id: deliveryitemdto.item_id,
                Operation: Operation.DELIVERY,
                source: delivery.source_type,
                location_id: delivery.location_id,
                destination: EntityType.Customer,
                destination_id: deliveryitemdto.customer_id,
                session: transactionSession,
            });
            await transactionSession.commitTransaction();
        } catch (err) {
            await transactionSession.abortTransaction();
            console.log('QUEUE failed to add', err);
        } finally {
            await transactionSession.endSession();
        }
    }

    // Complete Delivery
    async completeDelivery(
        delivery_id: string,
        loggedInUser: string,
    ) {        
        const delivery = await this.deliveryModel.findOne({ delivery_id }).exec();
        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }
        await this.deliveryModel.updateOne(
            { delivery_id: delivery_id },
            { $set: { ended_at: AppUtils.getIsoUtcMoment(), updated_at: AppUtils.getIsoUtcMoment(), updated_by: loggedInUser } }
        )
    }

    // Delete Delivery by Id
    async deleteDelivery(delivery_id: string, loggedInUser: User) {
        const delivery = await this.deliveryModel.findOne({ delivery_id }).exec();
        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }
        await this.deliveryModel.updateOne({ delivery_id }, { status: 0 });
        return;
    }

    // Restore Delivery by Id
    async restoreDelivery(delivery_id: string, loggedInUser: User) {
        const delivery = await this.deliveryModel.findOne({ delivery_id }).exec();
        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }
        await this.deliveryModel.updateOne({ delivery_id }, { status: 1 });
        return;
    }

}