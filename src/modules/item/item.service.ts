import {
    BadRequestException,
    Injectable,
    NotAcceptableException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueueHandler } from 'src/enums/queue-handler.enum';
import { AppConstant } from '../../utils/app.constants';
import { AppUtils } from '../../utils/app.utils';
import { Item, ItemDocument } from './schemas/item.schema';
import { ItemDto } from './dto/item.dto';
import { ItemBlock, ItemBlockDocument } from './schemas/item-block.schema';
import { Inventory, InventoryDocument } from '../inventory/schemas/inventory.schema';
import { Models, ModelsDocument } from '../model/schemas/model.schema';
import { ItemDataDto } from './dto/itemData.dto';
import { ItemLocation } from 'src/enums/item-location.enum';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { User } from '../users/schemas/user.schema';
import * as SHA256 from 'crypto-js/sha256';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { crypto } from 'crypto-js';
import { Operation } from 'src/enums/operation.enum';

@Injectable()
export class ItemService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectQueue('item') private itemQueue: Queue,
        @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
        @InjectModel(ItemBlock.name) private itemblockModel: Model<ItemBlockDocument>,
        @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
        @InjectModel(Models.name) private modelModel: Model<ModelsDocument>,
        private autoIncrementService: AutoIncrementService,
    ) {
        itemQueue.on('error', (err) => {
            console.log('Error connecting to QUEUE', err);
        });
    }

    // Query Item
    async queryItem(filter: any) {
        const item = await this.itemModel.findOne(filter).exec();
        return item;
    }

    // Add Item
    async addItem(itemDto: ItemDto, loggedInUser: User) {

        // Check for Item
        const itemcheck = await this.itemModel
            .findOne({ serial_number: itemDto.serial_number, status: 1 })
            .exec();
        if (itemcheck) {
            throw new BadRequestException('Item already exists');
        }
        // Create Item Id
        const item_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.ITEM,
        );
        const item = new Item();
        item.item_id = item_id;
        item.model_id = itemDto.model_id;
        item.serial_number = itemDto.serial_number;
        item.price = itemDto.price;
        item.created_at = AppUtils.getIsoUtcMoment();
        item.updated_at = AppUtils.getIsoUtcMoment();
        item.created_by = loggedInUser.user_id;
        item.updated_by = loggedInUser.user_id;
        try {
            await this.itemModel.create(item);
            const itemData: ItemDataDto = {
                item_id: item_id,
                model_id: item.model_id,
                serial_number: item.serial_number,
                price: item.price,
                timestamp: item.created_at,
            }

            // Add ItemBlock into the queue
            try {
                await this.itemQueue.add(QueueHandler.ITEM, {
                    item_id: item_id,
                    itemData: itemData,
                    Operation: Operation.CREATE,
                    source: ItemLocation.Company,
                    destination: ItemLocation.Company,
                });
            } catch (err) {
                console.log('QUEUE failed to add', err);
            }
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.ITEM);
            return { status: false, data: e };
        }
    }

    // GET All Items list
    async getItems(
        loggedInUser: User,
        model_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { model_id: model_id, status: 1 };
        if (search) {
            params.model_number = { $regex: search };
        }
        const count = await this.itemModel.count(params).exec();
        const list = await this.itemModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Item by Id
    async getItemById(id: string, loggedInUser: User) {
        const item = await this.itemModel
            .findOne({ item_id: id })
            .exec();
        return item;
    }

    // Update Item by Id
    async updateItem(
        item_id: string,
        itemDto: ItemDto,
        loggedInUser: User,
    ) {
        const item = await this.itemModel.findOne({ item_id }).exec();
        if (!item) {
            throw new NotFoundException('Item not found');
        }
        item.model_id = itemDto.model_id;
        item.serial_number = itemDto.serial_number;
        item.price = itemDto.price;
        item.updated_at = AppUtils.getIsoUtcMoment();
        item.updated_by = loggedInUser.user_id;
        return this.itemModel.updateOne({ item_id }, item);
    }

    // Delete Item by Id
    async deleteItem(item_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const item = await this.itemModel.findOne({ item_id }).exec();
        if (!item) {
            throw new NotFoundException('Item not found');
        }

        try {
            await this.itemModel.updateOne({ item_id }, { status: 0 });
            await this.inventoryModel.updateMany({ item_id: item_id }, { status: 0 });
            transactionSession.commitTransaction();
        } catch (err) {
            transactionSession.abortTransaction();
        } finally {
            transactionSession.endSession();
        }
        return;
    }

    // Restore Item by Id
    async restoreItem(item_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const item = await this.itemModel.findOne({ item_id }).exec();
        if (!item) {
            throw new NotFoundException('Item not found');
        }
        try {
            await this.itemModel.updateOne({ item_id }, { status: 1 });
            await this.inventoryModel.updateMany({ item_id: item_id }, { status: 1 });
            transactionSession.commitTransaction();
        } catch (err) {
            transactionSession.abortTransaction();
        } finally {
            transactionSession.endSession();
        }
        return;
    }

    // async createItemBlock(itemdata: ItemDataDto) {

    //     // Check for Item Block
    //     const itemblockcheck = await this.itemblockModel
    //         .findOne({ 'itemData.item_id': itemdata.item_id })
    //         .exec();
    //     if (itemblockcheck) {
    //         throw new BadRequestException('Item Block already exists');
    //     }

    //     // Create Item Block Id
    //     const item_block_id = await this.autoIncrementService.getNextSequence(
    //         AutoIncrementEnum.ITEMBLOCK,
    //     );

    //     // Fetch Preceding Hash
    //     const precedingblock = await this.itemblockModel.find().sort({ _id: -1 }).limit(1).exec();
    //     let precedingHash;
    //     if (precedingblock.length > 0) {
    //         precedingHash = precedingblock[0].hash;
    //     } else {
    //         precedingHash = 'Genisis Block';
    //     }

    //     const timestamp = AppUtils.getIsoUtcMoment();

    //     // Compute Hash
    //     const hash = SHA256(item_block_id + precedingHash + timestamp + JSON.stringify(itemdata)).toString();

    //     // const hash = AppUtils.getEncryptedPassword(item_block_id + precedingHash + timestamp + JSON.stringify(itemdata));

    //     // Create Item Block
    //     const itemblock = new ItemBlock();
    //     itemblock.item_block_id = item_block_id;
    //     // itemblock.transaction = itemdata;
    //     itemblock.timestamp = timestamp;
    //     itemblock.precedingHash = precedingHash;
    //     itemblock.hash = hash;

    //     try {
    //         await this.itemblockModel.create(itemblock);
    //         return { status: true, data: hash };
    //     } catch (e) {
    //         return { status: false, data: e };
    //     }
    // }

    async verifyItem(serial_number: string) {
        const item = await this.itemModel.findOne({ serial_number: serial_number }).exec();

        const itemblocks = await this.itemblockModel.aggregate([
            {
                "$setWindowFields": {
                    "partitionBy": null,
                    "sortBy": {
                        "_id": 1
                    },
                    "output": {
                        nearIds: {
                            $addToSet: "$_id",
                            window: {
                                documents: [
                                    -1,
                                    1
                                ]
                            }
                        }
                    }
                }
            },
            {
                "$match": {
                    hash: item.item_hash
                }
            },
            {
                "$lookup": {
                    "from": "itemblocks",
                    "localField": "nearIds",
                    "foreignField": "_id",
                    "as": "nearDocs"
                }
            },
            {
                "$unwind": "$nearDocs"
            },
            {
                "$replaceRoot": {
                    "newRoot": "$nearDocs"
                }
            }
        ]).exec()

        console.log(itemblocks)

        if (itemblocks.length === 3) {
            if (
                item.item_id == itemblocks[1].itemData.item_id &&
                item.serial_number == itemblocks[1].itemData.serial_number &&
                item.model_id == itemblocks[1].itemData.model_id &&
                item.price == itemblocks[1].itemData.price
            ) {
                if (
                    itemblocks[0].hash !== itemblocks[1].precedingHash ||
                    itemblocks[1].hash !== itemblocks[2].precedingHash
                ) {
                    throw new NotAcceptableException('Item data is tampered');
                } else {
                    const hash = SHA256(itemblocks[1].item_block_id + itemblocks[1].precedingHash + itemblocks[1].timestamp + JSON.stringify(itemblocks[1].itemData)).toString();
                    if (hash !== itemblocks[1].hash) {
                        throw new NotAcceptableException('Item data is tampered');
                    }
                    return { status: true, data: 'Item is verified' }
                }
            } else {
                throw new NotAcceptableException('Item is not verified');
            }
        } else {
            if (itemblocks[0].hash !== itemblocks[1].precedingHash) {
                throw new NotAcceptableException('Item data is tampered');
            } else {
                const hash = SHA256(itemblocks[0].item_block_id + itemblocks[0].precedingHash + itemblocks[0].timestamp + JSON.stringify(itemblocks[0].itemData)).toString();
                if (hash !== itemblocks[0].hash) {
                    throw new NotAcceptableException('Item data is tampered');
                }
                return { status: true, data: 'Item is verified' }
            }
        }
    }

}






