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
import { ServiceCenter, ServiceCenterDocument } from './schemas/service-center.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { User } from '../users/schemas/user.schema';

// Enum
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { UserType } from 'src/enums/user-type.enum';
import { ItemLocation } from 'src/enums/item-location.enum';
import { EntityType } from 'src/enums/entity-type.enum';

// Dto
import { ServiceCenterDto } from './dto/service-center.dto';

// Services
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { InventoryService } from '../inventory/inventory.service';
import { RoleService } from '../role/role.service';

// Utils
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class ServiceCenterService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(ServiceCenter.name) private servicecenterModel: Model<ServiceCenterDocument>,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        private autoIncrementService: AutoIncrementService,
        private inventoryService: InventoryService,
        private roleservice: RoleService,
    ) { }

    // Query Service Center
    async queryServiceCenter(filter: any) {
        const servicecenter = await this.servicecenterModel.findOne(filter).exec();
        return servicecenter;
    }

    // Add Service Center
    async addServiceCenter(servicecenterDto: ServiceCenterDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Service Center
        const servicecentercheck = await this.servicecenterModel
            .findOne({ phone_number: servicecenterDto.phone_number, status: 1 })
            .exec();
        if (servicecentercheck) {
            throw new BadRequestException('Service Center already exists');
        }
        // Create Service Center Id
        const servicecenter_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.SERVICECENTER,
            transactionSession,
        );

        const servicecenter = new ServiceCenter();
        servicecenter.servicecenter_id = servicecenter_id;
        servicecenter.company_id = servicecenterDto.company_id;
        servicecenter.code = servicecenterDto.code;
        servicecenter.incharge = servicecenterDto.incharge;
        servicecenter.email = servicecenterDto.email;
        servicecenter.phone_number = servicecenterDto.phone_number;
        servicecenter.created_at = AppUtils.getIsoUtcMoment();
        servicecenter.updated_at = AppUtils.getIsoUtcMoment();
        servicecenter.created_by = loggedInUser.user_id;
        servicecenter.updated_by = loggedInUser.user_id;
        try {
            await this.servicecenterModel.create([servicecenter], { transactionSession });
            await this.companyModel.updateOne({ company_id: servicecenterDto.company_id }, { $inc: { service_centers: 1 } }, { transactionSession });

            // Create Role for the Service Center Incharge
            const inchargeroledata = {
                entity_id: servicecenterDto.company_id,
                role: UserType.ServiceCenterIncharge,
            }

            const incharge_role = await this.roleservice.addRole(inchargeroledata, loggedInUser.user_id, transactionSession);

            // Add Permissions to the Service Center Incharge Role
            if (incharge_role.status === true) {
                var permissions = await this.roleservice.servicecenterincharge_permissions();
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

    // GET All Service Centers list
    async getServiceCenters(
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
        const count = await this.servicecenterModel.count(params).exec();
        const list = await this.servicecenterModel
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
                {
                    $project: {
                        servicecenter_id: '$servicecenter_id',
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

    // GET Service Center by Id
    async getServiceCenterById(id: string, loggedInUser: User) {
        const servicecenter = await this.servicecenterModel
            .findOne({ servicecenter_id: id })
            .exec();
        return servicecenter;
    }

    // Update Complaint by Id
    async updateServiceCenter(
        servicecenter_id: string,
        servicecenterDto: ServiceCenterDto,
        loggedInUser: User,
    ) {
        const servicecenter = await this.servicecenterModel.findOne({ servicecenter_id }).exec();
        if (!servicecenter) {
            throw new NotFoundException('Service Center not found');
        }
        servicecenter.code = servicecenterDto.code;
        servicecenter.incharge = servicecenterDto.incharge;
        servicecenter.email = servicecenterDto.email;
        servicecenter.phone_number = servicecenterDto.phone_number;
        servicecenter.updated_at = AppUtils.getIsoUtcMoment();
        servicecenter.updated_by = loggedInUser.user_id;
        return this.servicecenterModel.updateOne({ servicecenter_id }, servicecenter);
    }

    // Add Location of the Service Center
    async addLocationToServiceCenter(
        location_id: string,
        servicecenter_id: string,
    ) {
        const servicecenter = await this.servicecenterModel.findOne({ servicecenter_id }).exec();
        if (!servicecenter) {
            throw new NotFoundException('Service Center not found');
        }
        return this.servicecenterModel.updateOne({ servicecenter_id }, { $set: { location_id: location_id } });
    }

    // Delete Service Center by Id
    async deleteServiceCenter(servicecenter_id: string, loggedInUser: User) {
        
        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const servicecenter = await this.servicecenterModel.findOne({ servicecenter_id }).exec();
        if (!servicecenter) {
            throw new NotFoundException('Service Center not found');
        }

        servicecenter.updated_at = AppUtils.getIsoUtcMoment();
        servicecenter.updated_by = loggedInUser.user_id;
        servicecenter.status = 0;

        try {
            await this.servicecenterModel.updateOne({ servicecenter_id }, servicecenter, { transactionSession });
            await this.companyModel.updateOne({ company_id: servicecenter.company_id }, { $inc: { service_centers: -1 } }, { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

    async addItemToServiceCenter(item_id: string, servicecenter_id: string, loggedInUser: User) {

    }

    // Restore Service Center by Id
    async restoreServiceCenter(servicecenter_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const servicecenter = await this.servicecenterModel.findOne({ servicecenter_id }).exec();
        if (!servicecenter) {
            throw new NotFoundException('Service Center not found');
        }

        servicecenter.updated_at = AppUtils.getIsoUtcMoment();
        servicecenter.updated_by = loggedInUser.user_id;
        servicecenter.status = 1;

        try {
            await this.servicecenterModel.updateOne({ servicecenter_id }, servicecenter, { transactionSession });
            await this.companyModel.updateOne({ company_id: servicecenter.company_id }, { $inc: { service_centers: 1 } }, { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

}







