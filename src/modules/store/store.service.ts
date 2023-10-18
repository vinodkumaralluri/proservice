import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

// mongoose
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';

// Schemas
import { Store, StoreDocument } from './schemas/store.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { User } from '../users/schemas/user.schema';

// Enum
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { UserType } from 'src/enums/user-type.enum';
import { ItemLocation } from 'src/enums/item-location.enum';
import { EntityType } from 'src/enums/entity-type.enum';

// Dto
import { StoreDto } from './dto/store.dto';

// Services
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { InventoryService } from '../inventory/inventory.service';
import { RoleService } from '../role/role.service';

// Utils
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class StoreService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        private autoIncrementService: AutoIncrementService,
        private inventoryService: InventoryService,
        private roleservice: RoleService,
    ) { }

    // Query Store
    async queryStore(filter: any) {
        const store = await this.storeModel.findOne(filter).exec();
        return store;
    }

    // Add Store
    async addStore(storeDto: StoreDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Store
        const storecheck = await this.storeModel
            .findOne({ phone_number: storeDto.phone_number, status: 1 })
            .exec();
        if (storecheck) {
            throw new BadRequestException('Store already exists');
        }
        // Create Store Id
        const store_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.STORE,
            transactionSession,
        );

        const store = new Store();
        store.store_id = store_id;
        store.company_id = storeDto.company_id;
        store.code = storeDto.code;
        store.incharge = storeDto.incharge;
        store.email = storeDto.email;
        store.phone_number = storeDto.phone_number;
        store.created_at = AppUtils.getIsoUtcMoment();
        store.updated_at = AppUtils.getIsoUtcMoment();
        store.created_by = loggedInUser.user_id;
        store.updated_by = loggedInUser.user_id;
        try {
            await this.storeModel.create([store], { transactionSession });
            await this.companyModel.updateOne({ company_id: storeDto.company_id }, { $inc: { stores: 1 } }, { transactionSession });

            // Create Role for the Store Incharge
            const inchargeroledata = {
                entity_id: storeDto.company_id,
                role: UserType.StoreIncharge,
            }

            const incharge_role = await this.roleservice.addRole(inchargeroledata, loggedInUser.user_id, transactionSession);

            // Add Permissions to the Store Incharge Role
            if (incharge_role.status === true) {
                var permissions = await this.roleservice.storeincharge_permissions();
                try {
                    const permission = await this.roleservice.addPermission(permissions, incharge_role.data, loggedInUser.user_id, transactionSession);
                    if (permission.status === false) {
                        await transactionSession.abortTransaction();
                        return { status: false, message: permission.data };
                    }
                } catch (e) {
                    await transactionSession.abortTransaction();
                    return { status: false, message: e };
                }
            } else {
                await transactionSession.abortTransaction();
                return { status: false, data: incharge_role.message };
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

    // GET All Stores list
    async getStores(
        loggedInUser: User,
        company_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { company_id: company_id, status: 1 };
        if (search) {
            params.phone = { $regex: search };
        }
        const count = await this.storeModel.count(params).exec();
        const list = await this.storeModel
            .aggregate([
                {
                    $match: params,
                },
                {
                    $limit: limit,
                },
                {
                    $lookup: {
                        from: 'employees',
                        localField: 'manager',
                        foreignField: 'employee_id',
                        as: 'employee_doc',
                    },
                },
                { $unwind: '$employee_doc' },
                {
                    $project: {
                        store_id: '$store_id',
                        company_id: '$company_id',
                        code: '$code',
                        manager: '$employee_id',
                        manager_name: '$employee_doc.first_name',
                        email: '$email',
                        phone_number: '$phone_number',
                        employees: '$employees',
                        products: '$products',
                        inventory: '$inventory',
                        rating: '$rating',
                        reviews: '$reviews',
                        created_at: '$created_at',
                        created_by: '$created_by',
                        updated_at: '$updated_at',
                        updated_by: '$updated_by',
                        status: '$status',
                    },
                },
            ])
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Store by Id
    async getStoreById(id: string, loggedInUser: User) {
        const store = await this.storeModel
            .findOne({ store_id: id })
            .exec();
        return store;
    }

    // Update Store by Id
    async updateStore(
        store_id: string,
        storeDto: StoreDto,
        loggedInUser: User,
    ) {
        const store = await this.storeModel.findOne({ store_id }).exec();
        if (!store) {
            throw new NotFoundException('Storer not found');
        }
        store.code = storeDto.code;
        store.incharge = storeDto.incharge;
        store.email = storeDto.email;
        store.phone_number = storeDto.phone_number;
        store.updated_at = AppUtils.getIsoUtcMoment();
        store.updated_by = loggedInUser.user_id;
        return this.storeModel.updateOne({ store_id }, store);
    }

    // Add Item to the Store
    async addItemToStore(
        item_id: string,
        store_id: string,
        source: ItemLocation,
        user_id: string,
    ) {

        const store = await this.storeModel.findOne({ store_id }).exec();
        if (!store) {
            throw new NotFoundException('Store not found');
        }

        const inventory = {
            unit_type: EntityType.Store,
            unit_id: store_id,
            item_id: item_id,
            incharge: '',
            source: source,
        }
        await this.inventoryService.addInventory(inventory, user_id);
    }

    // Delete Store by Id
    async deleteStore(store_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const store = await this.storeModel.findOne({ store_id }).exec();
        if (!store) {
            throw new NotFoundException('Store not found');
        }

        store.updated_at = AppUtils.getIsoUtcMoment();
        store.updated_by = loggedInUser.user_id;
        store.status = 0;

        try {
            await this.storeModel.updateOne({ store_id }, store, { transactionSession });
            await this.companyModel.updateOne({ company_id: store.company_id }, { $inc: { stores: -1 } }, { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

    // Restore Store by Id
    async restoreStore(store_id: string, loggedInUser: User) {

       // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const store = await this.storeModel.findOne({ store_id }).exec();
        if (!store) {
            throw new NotFoundException('Store not found');
        }

        store.updated_at = AppUtils.getIsoUtcMoment();
        store.updated_by = loggedInUser.user_id;
        store.status = 1;

        try {
            await this.storeModel.updateOne({ store_id }, store, { transactionSession });
            await this.companyModel.updateOne({ company_id: store.company_id }, { $inc: { stores: 1 } }, { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

}








