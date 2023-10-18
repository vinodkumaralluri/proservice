import { Process, Processor } from '@nestjs/bull';
import { BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { QueueHandler } from '../../enums/queue-handler.enum';
import { AppConstant } from '../../utils/app.constants';
import { AppUtils } from '../../utils/app.utils';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { Models, ModelsDocument } from '../model/schemas/model.schema';
import { Item, ItemDocument } from './schemas/item.schema';
import { Store, StoreDocument } from '../store/schemas/store.schema';
import { ServiceCenter, ServiceCenterDocument } from '../service-center/schemas/service-center.schema';
import { Warehouse, WarehouseDocument } from '../warehouse/schemas/warehouse.schema';
import { Factory, FactoryDocument } from '../factory/schemas/factory.schema';
import { ItemBlock, ItemBlockDocument } from './schemas/item-block.schema';
import { ItemDataDto } from './dto/itemData.dto';
import * as SHA256 from 'crypto-js/sha256';
import { Operation } from 'src/enums/operation.enum';
import { EntityType } from 'src/enums/entity-type.enum';
import { exec } from 'child_process';

@Processor('item')
export class ItemProcessor {
    private readonly logger = new Logger(ItemProcessor.name);

    constructor(
        @InjectModel(Models.name) private modelModel: Model<ModelsDocument>,
        @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
        @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
        @InjectModel(ServiceCenter.name) private servicecenterModel: Model<ServiceCenterDocument>,
        @InjectModel(Warehouse.name) private warehouseModel: Model<WarehouseDocument>,
        @InjectModel(Factory.name) private factoryModel: Model<FactoryDocument>,
        @InjectModel(ItemBlock.name) private itemblockModel: Model<ItemBlockDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Get Item Data
    async getItemData(item_id: string) {
        const item = await this.itemModel.findOne({item_id: item_id}).exec();
        const itemData: ItemDataDto = {
            item_id: item.item_id,
            model_id: item.model_id,
            serial_number: item.serial_number,
            price: item.price,
            timestamp: item.created_at,
        }
        return itemData;
    }

    // Get Item Block transaction Data
    async getTransactionData(job: any) {
        let source_id;
        let destination_id;
        if(job.data.operation === Operation.CREATE) {
            const model = await this.modelModel.findOne({ model_id: job.data.itemData.model_id });
            source_id = model.company_id;
            destination_id = model.company_id;
        } else if(job.data.operation === Operation.DELIVERY) {
            if(job.data.source === EntityType.Store) {
                source_id = await (await this.storeModel.findOne({ location_id: job.data.location_id }).exec()).store_id;
            } else if(job.data.source === EntityType.ServiceCenter) {
                source_id = await (await this.servicecenterModel.findOne({ location_id: job.data.location_id }).exec()).servicecenter_id;
            } else if(job.data.source === EntityType.WareHouse) {
                source_id = await (await this.warehouseModel.findOne({ location_id: job.data.location_id }).exec()).warehouse_id;
            } else if(job.data.source === EntityType.Factory) {
                source_id = await (await this.factoryModel.findOne({ location_id: job.data.location_id }).exec()).factory_id;
            }
            destination_id = job.data.destination_id;
        } else if(job.data.operation === Operation.PICKUP) {
            if(job.data.source === EntityType.Store) {
                destination_id = await (await this.storeModel.findOne({ location_id: job.data.location_id }).exec()).store_id;
            } else if(job.data.source === EntityType.ServiceCenter) {
                destination_id = await (await this.servicecenterModel.findOne({ location_id: job.data.location_id }).exec()).servicecenter_id;
            } else if(job.data.source === EntityType.WareHouse) {
                destination_id = await (await this.warehouseModel.findOne({ location_id: job.data.location_id }).exec()).warehouse_id;
            } else if(job.data.source === EntityType.Factory) {
                destination_id = await (await this.factoryModel.findOne({ location_id: job.data.location_id }).exec()).factory_id;
            }
            source_id = job.data.source_id;
        }

        const transactionData = {
            item_id: job.data.item_id,
            operation: job.data.operation,
            item_hash: job.data.item_hash,
            source: job.data.source,
            source_id: source_id,
            destination: job.data.destination,
            destination_id: destination_id,
        } 

        return transactionData;
    }

    // Create Item Hash
    async createItemHash(itemdata: ItemDataDto, session) {

        // Fetch Preceding Hash
        const precedingitem = await this.itemModel.find().sort({ _id: -1 }).limit(1).exec();
        let precedingItemHash;
        if (precedingitem.length > 0) {
            precedingItemHash = precedingitem[0].item_hash;
        } else {
            precedingItemHash = 'Genisis Item';
        }

        // Compute Hash
        const item_hash = SHA256(precedingItemHash + itemdata.timestamp + JSON.stringify(itemdata)).toString();

        await this.itemModel.updateOne([{item_id: itemdata.item_id}, {item_hash: item_hash}], {session});

        return item_hash;
    }

    // Get Item Hash
    async getItemHash(item_id: string) {

        const item_hash = await (await this.itemModel.findOne({item_id: item_id})).item_hash;
        return item_hash;
    }

    // Create Item Block
    async createItemBlock(data: any, session) {

        const timestamp = AppUtils.getIsoUtcMoment();

        // Check for Item Block
        const itemblockcheck = await this.itemblockModel
            .findOne({ 'transaction.item_id': data.itemData.item_id, timestamp: timestamp  })
            .exec();
        if (itemblockcheck) {
            throw new BadRequestException('Item Block already exists');
        }

        // Create Item Block Id
        const item_block_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.ITEMBLOCK,
            session,
        );

        // Fetch Preceding Hash
        const precedingblock = await this.itemblockModel.find().sort({ _id: -1 }).limit(1).exec();
        let precedingHash;
        if (precedingblock.length > 0) {
            precedingHash = precedingblock[0].hash;
        } else {
            precedingHash = 'Genisis Block';
        }

        // Compute Item Block Hash
        const hash = SHA256(item_block_id + precedingHash + timestamp + JSON.stringify(data.transactionData)).toString();

        // Create Item Block
        const itemblock = new ItemBlock();
        itemblock.item_block_id = item_block_id;
        itemblock.transaction = data.transactionData;
        itemblock.hash = hash;
        itemblock.precedingHash = precedingHash;
        itemblock.timestamp = timestamp;

        try {
            await this.itemblockModel.create([itemblock], {session});
            return { status: true, data: hash };
        } catch (e) {
            return { status: false, data: e };
        }
    }

    @Process(QueueHandler.ITEM)
    async handleItemBlockchain(job: Job, session: mongoose.ClientSession | null = null) {
        this.logger.debug('Processing Queue Item', job.data);
        if(job.data.operation === Operation.CREATE) {
            job.data.item_hash = await this.createItemHash(job.data.itemData, session);
        } else { 
            job.data.itemData = await this.getItemData(job.data.item_id);
            job.data.item_hash = await this.getItemHash(job.data.itemData.item_id);
        }
        job.data.transactionData = await this.getTransactionData(job.data); 
        await this.createItemBlock(job.data, session);
        this.logger.debug('Processing Queue Item Completed');
    }
}
