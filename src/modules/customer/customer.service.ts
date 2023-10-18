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
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { User } from '../users/schemas/user.schema';

// Enum
import { UserType } from 'src/enums/user-type.enum';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';

// Dto
import { CustomerDto } from './dto/customer.dto';

// Services
import { UserService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { RoleService } from '../role/role.service';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';

// Utils
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class CustomerService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        private autoIncrementService: AutoIncrementService,
        private userservice: UserService,
        private authService: AuthService,
        private roleService: RoleService,
    ) { }

    // Query Customer
    async queryCustomer(filter: any) {
        const customer = await this.customerModel.findOne(filter).exec();
        return customer;
    }

    // Add Customer
    async addCustomer(customerDto: CustomerDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Create Customer Id
        const customer_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.CUSTOMER,
            transactionSession,
        );

        var role_id = '';

        // Create Role for the Customer
        const customerrole = {
            entity_id: customer_id,
            role: UserType.Customer,
        }

        const customer_role = await this.roleService.addRole(customerrole, loggedInUser.user_id, transactionSession);

        // Add Permissions to the Customer Role
        if (customer_role.status === true) {
            role_id = customer_role.data;
            var permissions = await this.roleService.customer_permissions();
            try {
                const permission = await this.roleService.addPermission(permissions, role_id, loggedInUser.user_id, transactionSession);
                if (permission.status === false) {
                    return { status: false, message: permission.data };
                }
            } catch (e) {
                return { status: false, message: e };
            }
        } else {
            await transactionSession.abortTransaction();
            return { status: false, data: customer_role.message };
        }

        // Create User SignUp
        const user = {
            first_name: customerDto.first_name,
            last_name: customerDto.last_name,
            phone_number: customerDto.phone_number,
            email: customerDto.email,
            role_id: role_id,
            user_type: UserType.Customer,
            password: customerDto.phone_number,
        }
        let usersignup = await this.authService.signUp(user, transactionSession);

        if (usersignup.status === true) {
            // Check for Customer
            const customercheck = await this.customerModel
                .findOne({ first_name: customerDto.first_name, last_name: customerDto.last_name, status: 1 })
                .exec();
            if (customercheck) {
                throw new BadRequestException('Customer already exists');
            }

            const customer = new Customer();
            customer.customer_id = customer_id;
            customer.user_id = usersignup.user_id;
            customer.first_name = customerDto.first_name;
            customer.last_name = customerDto.last_name;
            customer.city = customerDto.city;
            customer.state = customerDto.state;
            customer.pincode = customerDto.pincode;
            customer.gender = customerDto.gender;
            customer.created_at = AppUtils.getIsoUtcMoment();
            customer.updated_at = AppUtils.getIsoUtcMoment();
            customer.created_by = loggedInUser.user_id;
            customer.updated_by = loggedInUser.user_id;

            try {
                await this.customerModel.create([customer], { transactionSession });
                await transactionSession.commitTransaction();
                return { status: true, data: 'success' };
            } catch (e) {
                await transactionSession.abortTransaction();
                return { status: false, data: e };
            } finally {
                await transactionSession.endSession();
            }
        }
    }

    // GET All Customers list
    async getCustomers(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        let params: any;
        if (search) {
            params = {
                $or: [
                    { first_name: { $regex: search } },
                    { last_name: { $regex: search } },
                ],
                status: 1,
            };
        } else {
            params = { status: 1 };
        }
        const count = await this.customerModel.count(params).exec();
        const list = await this.customerModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Customer by Id
    async getCustomerById(id: string, loggedInUser: User) {
        const customer = await this.customerModel
            .findOne({ customer_id: id })
            .exec();
        return customer;
    }

    // Update Customer by Id
    async updateCustomer(
        customer_id: string,
        customerDto: CustomerDto,
        loggedInUser: User,
    ) {
        const customer = await this.customerModel.findOne({ customer_id }).exec();
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }
        customer.first_name = customerDto.first_name;
        customer.last_name = customerDto.last_name;
        customer.city = customerDto.city;
        customer.state = customerDto.state;
        customer.pincode = customerDto.pincode;
        customer.gender = customerDto.gender;
        customer.updated_at = AppUtils.getIsoUtcMoment();
        customer.updated_by = loggedInUser.user_id;

        return this.customerModel.updateOne({ customer_id }, customer);
    }

    // Add Location of the Customer
    async addLocationToCustomer(
        location_id: string,
        customer_id: string,
    ) {
        const customer = await this.customerModel.findOne({ customer_id }).exec();
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }
        // const locations = customer.locations;
        // locations.push(location_id);
        return this.customerModel.updateOne({ customer_id }, { $set: {} });
    }

    // Delete Customer by Id
    async deleteCustomer(customer_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const customer = await this.customerModel.findOne({ customer_id }).exec();
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        customer.updated_at = AppUtils.getIsoUtcMoment();
        customer.updated_by = loggedInUser.user_id;
        customer.status = 0;

        try {
            await this.customerModel.findOneAndUpdate({ customer_id }, customer, { transactionSession });
            await this.userservice.deleteUser(customer.user_id, loggedInUser.user_id, transactionSession);
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

    // Restore Customer by Id
    async restoreCustomer(customer_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const customer = await this.customerModel.findOne({ customer_id }).exec();
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        customer.updated_at = AppUtils.getIsoUtcMoment();
        customer.updated_by = loggedInUser.user_id;
        customer.status = 1;

        try {
            await this.customerModel.updateOne({ customer_id }, customer, { transactionSession });
            await this.userservice.restoreUser(customer.user_id, loggedInUser.user_id, transactionSession);
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

}

