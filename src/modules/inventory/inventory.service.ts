import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueueHandler } from 'src/enums/queue-handler.enum';
import { AppConstant } from '../../utils/app.constants';
import { AppUtils } from '../../utils/app.utils';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { Models, ModelsDocument } from '../model/schemas/model.schema';
import { Item, ItemDocument } from '../item/schemas/item.schema';
import { Factory, FactoryDocument } from '../factory/schemas/factory.schema';
import { Store, StoreDocument } from '../store/schemas/store.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { InventoryDto } from './dto/inventory.dto';
import { User } from '../users/schemas/user.schema';
import { ItemLocation } from 'src/enums/item-location.enum';
import { EntityType } from 'src/enums/entity-type.enum';
import { ItemDataDto } from '../item/dto/itemData.dto';
import { Operation } from 'src/enums/operation.enum';

@Injectable()
export class InventoryService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectQueue('item') private itemQueue: Queue,
        @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
        @InjectModel(Models.name) private modelsModel: Model<ModelsDocument>,
        @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
        @InjectModel(Factory.name) private factoryModel: Model<FactoryDocument>,
        @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
        private autoIncrementService: AutoIncrementService,
    ) {
        itemQueue.on('error', (err) => {
            console.log('Error connecting to QUEUE', err);
        });
    }

    // Query Inventory
    async queryInventory(filter: any) {
        const inventory = await this.inventoryModel.findOne(filter).exec();
        return inventory;
    }

    // Add Inventory
    async addInventory(inventoryDto: InventoryDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Item
        const inventorycheck = await this.inventoryModel
            .findOne({ item_id: inventoryDto.item_id, unit_id: inventoryDto.unit_id, status: 1 })
            .exec();
        if (inventorycheck) {
            throw new BadRequestException('Inventory already exists');
        }
        // Create Inventory Id
        const inventory_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.INVENTORY,
            transactionSession,
        );
        const inventory = new Inventory();
        inventory.inventory_id = inventory_id;
        inventory.unit_type = inventoryDto.unit_type;
        inventory.unit_id = inventoryDto.unit_id;
        inventory.item_id = inventoryDto.item_id;
        inventory.incharge = inventoryDto.incharge;
        inventory.created_at = AppUtils.getIsoUtcMoment();
        inventory.updated_at = AppUtils.getIsoUtcMoment();
        inventory.created_by = loggedInUser;
        inventory.updated_by = loggedInUser;
        try {
            await this.inventoryModel.create([inventory], { transactionSession });
            let source: ItemLocation = inventoryDto.source;
            let destination: EntityType;
            if (inventoryDto.unit_type === EntityType.Factory) {
                await this.factoryModel.updateOne([
                    { factory_id: inventoryDto.unit_id },
                    { $inc: { inventory: 1 } }
                ],
                    { transactionSession }
                )
                await this.itemModel.updateOne([
                    { item_id: inventoryDto.item_id },
                    { item_location: ItemLocation.Factory }
                ],
                    { transactionSession }
                );
                destination = LocationType.Factory;
            } else if (inventoryDto.unit_type === LocationType.Distributor) {
                await this.distributorModel.updateOne([
                    { distributor_id: inventoryDto.unit_id },
                    { $inc: { inventory: 1 } }
                ],
                    { transactionSession }
                )
                await this.itemModel.updateOne([
                    { item_id: inventoryDto.item_id },
                    { item_location: ItemLocation.Distributor }
                ],
                    { transactionSession }
                );
                destination = LocationType.Distributor;
            } else if (inventoryDto.unit_type === LocationType.Retailer) {
                await this.retailerModel.updateOne([
                    { retailer_id: inventoryDto.unit_id },
                    { $inc: { inventory: 1 } }
                ],
                    { transactionSession }
                )
                await this.itemModel.updateOne([
                    { item_id: inventoryDto.item_id },
                    { item_location: ItemLocation.Retailer }
                ],
                    { transactionSession }
                );
                destination = LocationType.Retailer;
            } else if (inventoryDto.unit_type === LocationType.Store) {
                await this.storeModel.updateOne([
                    { store_id: inventoryDto.unit_id },
                    { $inc: { inventory: 1 } }
                ],
                    { transactionSession }
                )
                await this.itemModel.updateOne([
                    { item_id: inventoryDto.item_id },
                    { item_location: ItemLocation.Store }
                ],
                    { transactionSession }
                );
                destination = LocationType.Store;
            }
            // Add ItemBlock into the queue
            try {
                await this.itemQueue.add(QueueHandler.ITEM, {
                    item_id: inventoryDto.item_id,
                    Operation: Operation.CREATE,
                    source: source,
                    destination: destination,
                    session: transactionSession,
                });
            } catch (err) {
                console.log('QUEUE failed to add', err);
            }
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }
    }

    // GET All Inventories list
    async getInventories(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            params.item_id = { $regex: search };
        }
        const count = await this.inventoryModel.count(params).exec();
        const list = await this.inventoryModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Inventory by Id
    async getInventoryById(loggedInUser: User, id: string) {
        const inventory = await this.inventoryModel
            .findOne({ inventory_id: id })
            .exec();
        return inventory;
    }

    // GET Inventory by Store Id
    async getInventoryByStoreId(
        loggedInUser: User,
        store_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const list = await this.inventoryModel.aggregate([
            { $match: { store_id: store_id, status: 1 } },
            {
                $lookup: {
                    from: 'items',
                    localField: 'item_id',
                    foreignField: 'item_id',
                    as: 'items_doc',
                },
            },
            { $unwind: '$items_doc' },
            {
                $lookup: {
                    from: 'models',
                    localField: 'items_doc.model_id',
                    foreignField: 'model_id',
                    as: 'models_doc',
                },
            },
            { $unwind: '$models_doc' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'models_doc.product_id',
                    foreignField: 'product_id',
                    as: 'products_doc',
                },
            },
            { $unwind: '$products_doc' },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'incharge',
                    foreignField: 'employee_id',
                    as: 'employees_doc',
                },
            },
            { $unwind: '$employees_doc' },
            { $limit: limit },
            {
                $project: {
                    inventory_id: '$inventory_id',
                    store_id: '$store_id',
                    item_id: '$item_id',
                    serial_number: '$items_doc.serial_number',
                    model_id: '$models_doc.model_id',
                    model_number: '$models_doc.model_number',
                    product_id: '$products_doc.product_id',
                    product_name: '$products_doc.product_name',
                    company_id: '$models_doc.company_id',
                    employee_id: '$incharge',
                    incharge: '$employees_doc.first_name',
                    sold_by: '$sold_by',
                    inventory_status: '$inventory_status',
                    created_at: '$created_at',
                    created_by: '$created_by',
                    updated_at: '$updated_at',
                    updated_by: '$updated_by',
                    status: '$status',
                },
            }
        ]).skip((page - 1) * limit).exec();
        const count = list.length;
        return { list, count };
    }

    // GET Inventory by Model Id
    async getInventoryByModelId(
        loggedInUser: User,
        model_id: string,
        company_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const list = await this.inventoryModel.aggregate([
            { $match: { status: 1 } },
            {
                $lookup: {
                    from: 'items',
                    localField: 'item_id',
                    foreignField: 'item_id',
                    as: 'items_doc',
                },
            },
            { $unwind: '$items_doc' },
            {
                $lookup: {
                    from: 'models',
                    localField: 'items_doc.model_id',
                    foreignField: 'model_id',
                    as: 'models_doc',
                },
            },
            { $unwind: '$models_doc' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'models_doc.product_id',
                    foreignField: 'product_id',
                    as: 'products_doc',
                },
            },
            { $unwind: '$products_doc' },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'incharge',
                    foreignField: 'employee_id',
                    as: 'employees_doc',
                },
            },
            { $unwind: '$employees_doc' },
            { $limit: limit },
            {
                $project: {
                    inventory_id: '$inventory_id',
                    store_id: '$store_id',
                    item_id: '$item_id',
                    serial_number: '$items_doc.serial_number',
                    model_number: '$models_doc.model_number',
                    product_name: '$products_doc.product_name',
                    employee_id: '$incharge',
                    incharge: '$employees_doc.first_name',
                    inventory_status: '$inventory_status',
                    created_at: '$created_at',
                    created_by: '$created_by',
                    updated_at: '$updated_at',
                    updated_by: '$updated_by',
                    status: '$status',
                },
            }
        ]).skip((page - 1) * limit).exec();
        const count = list.length;
        return { list, count };
    }

    // GET Inventory by Product Id
    async getInventoryByProductId(
        loggedInUser: User,
        product_id: string,
        company_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const list = await this.inventoryModel.aggregate([
            { $match: { status: 1 } },
            {
                $lookup: {
                    from: 'items',
                    localField: 'item_id',
                    foreignField: 'item_id',
                    as: 'items_doc',
                },
            },
            { $unwind: '$items_doc' },
            {
                $lookup: {
                    from: 'models',
                    localField: 'items_doc.model_id',
                    foreignField: 'model_id',
                    as: 'models_doc',
                },
            },
            { $unwind: '$models_doc' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'models_doc.product_id',
                    foreignField: 'product_id',
                    as: 'products_doc',
                },
            },
            { $unwind: '$products_doc' },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'incharge',
                    foreignField: 'employee_id',
                    as: 'employees_doc',
                },
            },
            { $unwind: '$employees_doc' },
            { $limit: limit },
            {
                $project: {
                    inventory_id: '$inventory_id',
                    store_id: '$store_id',
                    item_id: '$item_id',
                    serial_number: '$items_doc.serial_number',
                    model_number: '$models_doc.model_number',
                    product_name: '$products_doc.product_name',
                    employee_id: '$incharge',
                    incharge: '$employees_doc.first_name',
                    inventory_status: '$inventory_status',
                    created_at: '$created_at',
                    created_by: '$created_by',
                    updated_at: '$updated_at',
                    updated_by: '$updated_by',
                    status: '$status',
                },
            }
        ]).skip((page - 1) * limit).exec();
        const count = list.length;
        return { list, count };
    }

    // Update Inventory by Id
    async updateInventory(
        inventory_id: string,
        inventoryDto: InventoryDto,
        loggedInUser: User,
    ) {
        const inventory = await this.inventoryModel.findOne({ inventory_id }).exec();
        if (!inventory) {
            throw new NotFoundException('Inventory not found');
        }
        inventory.unit_type = inventoryDto.unit_type;
        inventory.unit_id = inventoryDto.unit_id;
        inventory.item_id = inventoryDto.item_id;
        inventory.incharge = inventoryDto.incharge;
        inventory.updated_at = AppUtils.getIsoUtcMoment();
        inventory.updated_by = loggedInUser.user_id;
        return this.inventoryModel.updateOne({ inventory_id }, inventory);
    }

    // Delete Inventory by Id
    async deleteInventory(inventory_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const inventory = await this.inventoryModel.findOne({ inventory_id }).exec();
        if (!inventory) {
            throw new NotFoundException('Inventory not found');
        }

        try {
            await this.inventoryModel.updateOne([{ inventory_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

    // Restore Inventory by Id
    async restoreInventory(inventory_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const inventory = await this.inventoryModel.findOne({ inventory_id }).exec();
        if (!inventory) {
            throw new NotFoundException('Inventory not found');
        }
        try {
            await this.inventoryModel.updateOne([{ inventory_id }, { status: 1 }], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

}







