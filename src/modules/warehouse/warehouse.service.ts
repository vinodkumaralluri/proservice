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
import { Warehouse, WarehouseDocument } from './schemas/warehouse.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { User } from '../users/schemas/user.schema';

// Enum
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { UserType } from 'src/enums/user-type.enum';
import { ItemLocation } from 'src/enums/item-location.enum';
import { EntityType } from 'src/enums/entity-type.enum';

// Dto
import { WarehouseDto } from './dto/warehouse.dto';

// Services
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { InventoryService } from '../inventory/inventory.service';
import { RoleService } from '../role/role.service';

// Utils
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class WarehouseService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Warehouse.name) private warehouseModel: Model<WarehouseDocument>,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        private autoIncrementService: AutoIncrementService,
        private inventoryService: InventoryService,
        private roleservice: RoleService,
    ) { }

    // Query Warehouse
    async queryWarehouse(filter: any) {
        const warehouse = await this.warehouseModel.findOne(filter).exec();
        return warehouse;
    }

    // Add Warehouse
    async addWarehouse(warehouseDto: WarehouseDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Warehouse
        const warehousecheck = await this.warehouseModel
            .findOne({ phone_number: warehouseDto.phone_number, status: 1 })
            .exec();
        if (warehousecheck) {
            throw new BadRequestException('Warehouse already exists');
        }
        // Create Warehouse Id
        const warehouse_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.WAREHOUSE,
            transactionSession,
        );
        const warehouse = new Warehouse();
        warehouse.warehouse_id = warehouse_id;
        warehouse.company_id = warehouseDto.company_id;
        warehouse.code = warehouseDto.code;
        warehouse.incharge = warehouseDto.incharge;
        warehouse.email = warehouseDto.email;
        warehouse.phone_number = warehouseDto.phone_number;
        warehouse.created_at = AppUtils.getIsoUtcMoment();
        warehouse.updated_at = AppUtils.getIsoUtcMoment();
        warehouse.created_by = loggedInUser.user_id;
        warehouse.updated_by = loggedInUser.user_id;
        try {
            await this.warehouseModel.create([warehouse], { transactionSession });
            await this.companyModel.updateOne({ company_id: warehouseDto.company_id }, { $inc: { warehouses: 1 } }, { transactionSession });

            // Create Role for the Warehouse Incharge
            const inchargeroledata = {
                entity_id: warehouseDto.company_id,
                role: UserType.WarehouseIncharge,
            }

            const incharge_role = await this.roleservice.addRole(inchargeroledata, loggedInUser.user_id, transactionSession);

            // Add Permissions to the Warehouse Incharge Role
            if (incharge_role.status === true) {
                var permissions = await this.roleservice.warehouseincharge_permissions();
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

    // GET All Warehouses list
    async getWarehouses(
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
        const count = await this.warehouseModel.count(params).exec();
        const list = await this.warehouseModel
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
                        warehouse_id: '$warehouse_id',
                        company_id: '$company_id',
                        code: '$code',
                        incharge: '$incharge',
                        incharge_name: '$employee_doc.first_name',
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

    // GET Warehouse by Id
    async getWarehouseById(id: string, loggedInUser: User) {
        const warehouse = await this.warehouseModel
            .findOne({ warehouse_id: id })
            .exec();
        return warehouse;
    }

    // Update Warehouse by Id
    async updateWarehouse(
        warehouse_id: string,
        warehouseDto: WarehouseDto,
        loggedInUser: User,
    ) {
        const warehouse = await this.warehouseModel.findOne({ warehouse_id }).exec();
        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }
        warehouse.code = warehouseDto.code;
        warehouse.incharge = warehouseDto.incharge;
        warehouse.email = warehouseDto.email;
        warehouse.phone_number = warehouseDto.phone_number;
        warehouse.updated_at = AppUtils.getIsoUtcMoment();
        warehouse.updated_by = loggedInUser.user_id;
        return this.warehouseModel.updateOne({ warehouse }, warehouse);
    }

    // Add Item to the Warehouse
    async addItemToWarehouse(
        item_id: string,
        warehouse_id: string,
        source: ItemLocation,
        user_id: string,
    ) {

        const warehouse = await this.warehouseModel.findOne({ warehouse_id }).exec();
        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }

        const inventory = {
            unit_type: EntityType.WareHouse,
            unit_id: warehouse_id,
            item_id: item_id,
            incharge: '',
            source: source,
        }
        await this.inventoryService.addInventory(inventory, user_id);
    }

    // Delete Warehouse by Id
    async deleteWarehouse(warehouse_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const warehouse = await this.warehouseModel.findOne({ warehouse_id }).exec();
        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }

        warehouse.updated_at = AppUtils.getIsoUtcMoment();
        warehouse.updated_by = loggedInUser.user_id;
        warehouse.status = 0;

        try {
            await this.warehouseModel.updateOne({ warehouse_id }, warehouse, { transactionSession });
            await this.companyModel.updateOne({ company_id: warehouse.company_id }, { $inc: { warehouses: -1 } }, { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

    // Restore Warehouse by Id
    async restoreWarehouse(warehouse_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const warehouse = await this.warehouseModel.findOne({ warehouse_id }).exec();
        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }

        warehouse.updated_at = AppUtils.getIsoUtcMoment();
        warehouse.updated_by = loggedInUser.user_id;
        warehouse.status = 1;

        try {
            await this.warehouseModel.updateOne({ warehouse_id }, warehouse, { transactionSession });
            await this.companyModel.updateOne({ company_id: warehouse.company_id }, { $inc: { warehouses: 1 } }, { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

}










