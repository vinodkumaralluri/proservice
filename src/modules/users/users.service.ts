import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { UserType } from '../../enums/user-type.enum';
import { AppConstant } from '../../utils/app.constants';
import { AppUtils } from '../../utils/app.utils';
import { User, UserDocument } from './schemas/user.schema';
import { Employee, EmployeeDocument } from '../employee/schemas/employee.schema';
import { Customer, CustomerDocument } from '../customer/schemas/customer.schema';
import * as moment from 'moment';
// import { AutoIncrementService } from '../auto-increment/auto-increment.service';
// import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { SmsSenderService } from '../sms-sender/sms-sender.service';
// import { v4 as uuidv4 } from 'uuid';
// import { SignUpDto } from '../auth/dto/signup.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectConnection() private readonly connection: mongoose.Connection,
        // private smsSenderService: SmsSenderService,
        // private autoIncrementService: AutoIncrementService,
    ) { }

    // Query User
    async queryUser(filter: any) {
        const user = await this.userModel.findOne(filter).exec();
        return user;
    }

    // Get User by Id
    async findByUserId(user_id: string) {
        const user = this.queryUser({ user_id: user_id, status: 1 });
        if (!user) {
            throw new NotFoundException('User not found.');
        }
        return user;
    }

    // Update User API
    async update(
        user_id: string,
        updateUserDto: UpdateUserDto,
        loggedInUser: User,
    ) {
        // Check for Existence of the User
        const user = await this.userModel.findOne({ user_id }).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        // Check for the changed data
        const existingUser = await this.userModel.findOne({
            $or: [
                { email: updateUserDto.email },
                { phone_number: updateUserDto.phone_number },
            ],
            status: 1,
        });
        if (existingUser) {
            throw new BadRequestException('An User with the details already exists');
        }

        user.phone_number = updateUserDto.phone_number;
        user.email = updateUserDto.email;
        user.is2FaEnabled = updateUserDto.is2FaEnabled;
        try {
            await this.userModel.updateOne({ user_id }, user);
        } catch (e) {
            return { status: false, data: e };
        }
    }

    // Delete User
    async deleteUser(user_id: string, loggedInUser: string, session: mongoose.ClientSession | null = null) {
        const user = await this.userModel.findOne({ user_id }).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.updated_at = AppUtils.getIsoUtcMoment();
        user.updated_by = loggedInUser;
        user.status = 0;

        try {
            await this.userModel.findOneAndUpdate({ user_id }, user, { session });
        } catch (e) {
            return { status: false, data: e };
        }
    }

    // Restore User
    async restoreUser(user_id: string, loggedInUser: string, session: mongoose.ClientSession | null = null) {
        const user = await this.userModel.findOne({ user_id }).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.updated_at = AppUtils.getIsoUtcMoment();
        user.updated_by = loggedInUser;
        user.status = 1;

        try {
            await this.userModel.updateOne({ user_id }, user, { session });
        } catch (e) {
            return { status: false, data: e };
        }
    }

    async getUsers(
        user: User,
        page = 1,
        limit: any = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        let params: any = { status: 1 };
        if (search) {
            params = {
                $or: [
                    { user_id: { $regex: search } },
                    { phone_number: { $regex: search } },
                    { email: { $regex: search } },
                ],
            };
        }
        if (user.user_type == UserType.SuperAdmin) {
            const count = await this.userModel.count(params).exec();
            const list = await this.userModel
                .aggregate([
                    {
                        $match: params,
                    },
                    {
                        $limit: parseInt(limit),
                    },
                    {
                        $project: {
                            user_id: '$user_id',
                            phone_number: '$phone_number',
                            email: '$email',
                            user_type: '$user_type',
                            is2FaEnabled: '$is2FaEnabled',
                            otp: '$otp',
                            otpExpiry: '$otpExpiry',
                            last_login_date: '$last_login_date',
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
        // TODO: Add code to return users for a normal user
        return [];
    }

    // Change Password
    async changePassword(user_id: string, password: string) {
        const user = await this.queryUser({ user_id });
        if (!user) {
            throw new NotFoundException('User not found.');
        }
        password = await AppUtils.getEncryptedPassword(password);
        await this.userModel.findOneAndUpdate({ user_id }, { password });
    }

    // Send OTP
    async sendOtp(user_id) {
        const user = await this.queryUser({ user_id });
        if (!user) {
            throw new NotFoundException('User not found.');
        }
        const otp = AppUtils.generateOtp();
        user.phone_number = '7799378319';
        // this.smsSenderService.sendOtpSms(otp, user.phone_number);
        const utcDate = AppUtils.getExpiryDate();
        await this.userModel.findOneAndUpdate(
            { user_id },
            { otp, otpExpiry: utcDate },
        );
        console.log('Genrated OTP', otp);
        // TODO: Send OTP to user on mobile.
    }

    // Verify OTP
    async verifyOtp(user_id: string, otp: string) {
        const user = await this.queryUser({ user_id });
        if (!user) {
            throw new NotFoundException('User not found.');
        }
        if (user.otp !== otp) {
            throw new UnauthorizedException('Invalid OTP');
        }
        const currentMoment = AppUtils.getUtcMoment();
        const otpExpiry = AppUtils.getUtcMoment(user.otpExpiry);
        if (!moment(otpExpiry).isAfter(currentMoment)) {
            throw new UnauthorizedException('OTP is Expired');
        }
    }

}
