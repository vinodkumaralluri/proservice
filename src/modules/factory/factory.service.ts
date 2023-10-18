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
import { Factory, FactoryDocument } from './schemas/factory.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { User } from '../users/schemas/user.schema';

// Enum
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { UserType } from 'src/enums/user-type.enum';
import { EntityType } from 'src/enums/entity-type.enum';
import { ItemLocation } from 'src/enums/item-location.enum';

// Dto
import { FactoryDto } from './dto/factory.dto';

// Services
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { InventoryService } from '../inventory/inventory.service';
import { RoleService } from '../role/role.service';

// Utils
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class FactoryService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Factory.name) private factoryModel: Model<FactoryDocument>,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        private autoIncrementService: AutoIncrementService,
        private inventoryService: InventoryService,
        private roleservice: RoleService,
    ) { }

    // Query Factory
    async queryFactory(filter: any) {
        const factory = await this.factoryModel.findOne(filter).exec();
        return factory;
    }

    // Add Factory
    async addFactory(factoryDto: FactoryDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Factory
        const factorycheck = await this.factoryModel
            .findOne({ phone_number: factoryDto.phone_number, status: 1 })
            .exec();
        if (factorycheck) {
            throw new BadRequestException('Factory already exists');
        }
        // Create Factory Id
        const factory_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.FACTORY,
            transactionSession,
        );
        const factory = new Factory();
        factory.factory_id = factory_id;
        factory.company_id = factoryDto.company_id;
        factory.code = factoryDto.code;
        factory.incharge = factoryDto.incharge;
        factory.email = factoryDto.email;
        factory.phone_number = factoryDto.phone_number;
        factory.created_at = AppUtils.getIsoUtcMoment();
        factory.updated_at = AppUtils.getIsoUtcMoment();
        factory.created_by = loggedInUser.user_id;
        factory.updated_by = loggedInUser.user_id;
        try {
            await this.factoryModel.create([factory], { transactionSession });
            await this.companyModel.updateOne({ company_id: factoryDto.company_id }, { $inc: { factories: 1 } }, { transactionSession });

            // Create Role for the Factory Incharge
            const inchargeroledata = {
                entity_id: factoryDto.company_id,
                role: UserType.FactoryIncharge,
            }

            const incharge_role = await this.roleservice.addRole(inchargeroledata, loggedInUser.user_id, transactionSession);

            // Add Permissions to the Company Owner Role
            if (incharge_role.status === true) {
                var permissions = await this.roleservice.factoryincharge_permissions();
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

    // GET All Factories list
    async getFactories(
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
        const count = await this.factoryModel.count(params).exec();
        const list = await this.factoryModel
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
                        factory_id: '$factory_id',
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

    // GET Factory by Id
    async getFactoryById(id: string, loggedInUser: User) {
        const factory = await this.factoryModel
            .findOne({ factory_id: id })
            .exec();
        return factory;
    }

    // Update Factory by Id
    async updateFactory(
        factory_id: string,
        factoryDto: FactoryDto,
        loggedInUser: User,
    ) {
        const factory = await this.factoryModel.findOne({ factory_id }).exec();
        if (!factory) {
            throw new NotFoundException('Factory not found');
        }
        factory.code = factoryDto.code;
        factory.incharge = factoryDto.incharge;
        factory.email = factoryDto.email;
        factory.phone_number = factoryDto.phone_number;
        factory.updated_at = AppUtils.getIsoUtcMoment();
        factory.updated_by = loggedInUser.user_id;
        return this.factoryModel.updateOne({ factory_id }, factory);
    }

    // Add Item to the Factory
    async addItemToFactory(
        item_id: string,
        factory_id: string,
        user_id: string,
    ) {

        const factory = await this.factoryModel.findOne({ factory_id }).exec();
        if (!factory) {
            throw new NotFoundException('Factory not found');
        }

        const inventory = {
            unit_type: EntityType.Factory,
            unit_id: factory_id,
            item_id: item_id,
            incharge: '',
            source: ItemLocation.Company,
        }
        await this.inventoryService.addInventory(inventory, user_id);
    }

    // Delete Factory by Id
    async deleteFactory(factory_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const factory = await this.factoryModel.findOne({ factory_id }).exec();
        if (!factory) {
            throw new NotFoundException('Factory not found');
        }

        factory.updated_at = AppUtils.getIsoUtcMoment();
        factory.updated_by = loggedInUser.user_id;
        factory.status = 0;

        try {
            await this.factoryModel.updateOne({ factory_id }, factory, { transactionSession });
            await this.companyModel.updateOne({company_id: factory.company_id}, { $inc: { factories: -1 }}, { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

    // Restore Factory by Id
    async restoreFactory(factory_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const factory = await this.factoryModel.findOne({ factory_id }).exec();
        if (!factory) {
            throw new NotFoundException('Factory not found');
        }

        factory.updated_at = AppUtils.getIsoUtcMoment();
        factory.updated_by = loggedInUser.user_id;
        factory.status = 1;

        try {
            await this.factoryModel.updateOne([{ factory_id }, { status: 1 }], { transactionSession });
            await this.companyModel.updateOne({company_id: factory.company_id}, { $inc: { factories: 1 }}, { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

}









