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
import { Address, AddressDocument } from './schemas/address.schema';
import { User } from '../users/schemas/user.schema';

// Enum
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { EntityType } from 'src/enums/entity-type.enum';

// Dto
import { AddressDto } from './dto/address.dto';

// Services
import { AutoIncrementService } from '../auto-increment/auto-increment.service';

// Utils
import { AppUtils } from '../../utils/app.utils';


@Injectable()
export class AddressService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Address
    async queryAddress(filter: any) {
        const address = await this.addressModel.findOne(filter).exec();
        return address;
    }

    // Add Address
    async addAddress(addressDto: AddressDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Address
        const addresscheck = await this.addressModel
            .findOne({ latitude: addressDto.latitude, longitude: addressDto.longitude, status: 1 })
            .exec();
        if (addresscheck) {
            throw new BadRequestException('Address already exists');
        }
        // Create Address Id
        const address_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.ADDRESS,
            transactionSession,
        );

        const address = new Address();
        address.address_id = address_id;
        address.company_id = addressDto.company_id;
        address.entity_id = addressDto.entity_id;
        address.entity_type = addressDto.entity_type;
        address.house_no = addressDto.house_no;
        address.plot_no = addressDto.plot_no;
        address.landmark = addressDto.landmark;
        address.street = addressDto.street;
        address.area = addressDto.area;
        address.city = addressDto.city;
        address.district = addressDto.disrtrict;
        address.state = addressDto.state;
        address.pincode = addressDto.pincode;
        address.latitude = addressDto.latitude;
        address.longitude = addressDto.longitude;
        address.created_at = AppUtils.getIsoUtcMoment();
        address.updated_at = AppUtils.getIsoUtcMoment();
        address.created_by = loggedInUser;
        address.updated_by = loggedInUser;
        try {
            await this.addressModel.create([address], { transactionSession });
            await transactionSession.commitTransaction();
            return { status: true, data: address_id };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }
    }

    // GET All Addresses of the Entity
    async getAddressesByEntity(
        loggedInUser: User,
        entity_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { entity_id: entity_id, status: 1 };
        const count = await this.addressModel.count(params).exec();
        const list = await this.addressModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Address by Id
    async getAddressById(id: string, loggedInUser: User) {
        const address = await this.addressModel
            .findOne({ address_id: id })
            .exec();
        return address;
    }

    // Update Address by Id
    async updateAddress(
        address_id: string,
        addressDto: AddressDto,
        loggedInUser: User,
    ) {
        const address = await this.addressModel.findOne({ address_id }).exec();
        if (!address) {
            throw new NotFoundException('Address not found');
        }
        address.house_no = addressDto.house_no;
        address.plot_no = addressDto.plot_no;
        address.landmark = addressDto.landmark;
        address.street = addressDto.street;
        address.area = addressDto.area;
        address.city = addressDto.city;
        address.district = addressDto.disrtrict;
        address.state = addressDto.state;
        address.pincode = addressDto.pincode;
        address.latitude = addressDto.latitude;
        address.longitude = addressDto.longitude;
        address.updated_at = AppUtils.getIsoUtcMoment();
        address.updated_by = loggedInUser.user_id;

        return await this.addressModel.updateOne({ address_id }, address);
    }


    // Delete Address by Id
    async deleteAddress(address_id: string, loggedInUser: User) {
        const address = await this.addressModel.findOne({ address_id }).exec();
        if (!address) {
            throw new NotFoundException('Address not found');
        }

        address.updated_at = AppUtils.getIsoUtcMoment();
        address.updated_by = loggedInUser.user_id;
        address.status = 0;

        await this.addressModel.updateOne({ address_id }, address);
        return;
    }

    // Restore Address by Id
    async restoreAddress(address_id: string, loggedInUser: User) {
        const address = await this.addressModel.findOne({ address_id }).exec();
        if (!address) {
            throw new NotFoundException('Address not found');
        }

        address.updated_at = AppUtils.getIsoUtcMoment();
        address.updated_by = loggedInUser.user_id;
        address.status = 1;

        await this.addressModel.updateOne({ address_id }, address);
        return;
    }

}


