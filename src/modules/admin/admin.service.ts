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
import { Admin, AdminDocument } from './schemas/admin.schema';
import { User } from '../users/schemas/user.schema';

// Dto
import { AdminDto } from './dto/admin.dto';

// Enums
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { UserType } from 'src/enums/user-type.enum';

// Services
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AuthService } from '../auth/auth.service';
import { RoleService } from '../role/role.service';

// Utils
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class AdminService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        private autoIncrementService: AutoIncrementService,
        private authService: AuthService,
        private roleService: RoleService,
    ) { }

    // Query Admin
    async queryAdmin(filter: any) {
        const admin = await this.adminModel.findOne(filter).exec();
        return admin;
    }

    // Add Admin
    async addAdmin(adminDto: AdminDto) {

        // Check for Existing Admins
        const admins = await this.adminModel.find({ status: 1 }).exec();

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Create Admin Id
        const admin_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.ADMIN,
            transactionSession,
        );

        if (admins.length == 0) {
            
            var user_id = 'U1';
            var role_id = '';

            // Create Role for the Super Admin
            const SuperAdmin_role = {
                entity_id: admin_id,
                role: UserType.SuperAdmin,
            }

            const superadmin_role = await this.roleService.addRole(SuperAdmin_role, user_id, transactionSession);

            if (superadmin_role.status === true) {

                role_id = superadmin_role.data;

                // Add Role to the User
                // await this.authService.addRoletoUser(usersignup.user_id, role_id, transactionSession);

                // Add Permissions to the Role
                var permissions = await this.roleService.superadmin_permissions();
                try {
                    const permission = await this.roleService.addPermission(permissions, superadmin_role.data, user_id, transactionSession);
                    if (permission.status === false) {
                        return { status: false, user_id: user_id, message: permission.data };
                    }
                } catch (e) {
                    return { status: false, user_id: user_id, message: e };
                }
            } else {
                return { status: false, user_id: user_id, message: superadmin_role.message };
            }

            // Create Role for the Admin
            const Admin_role = {
                entity_id: admin_id,
                role: UserType.Admin,
            }

            const admin_role = await this.roleService.addRole(Admin_role, user_id, transactionSession);
            if (admin_role.status === true) {
                var permissions = await this.roleService.admin_permissions();
                try {
                    const permission = await this.roleService.addPermission(permissions, admin_role.data, user_id, transactionSession);
                    if (permission.status === false) {
                        return { status: false, user_id: user_id, message: permission.data };
                    }
                } catch (e) {
                    return { status: false, user_id: user_id, message: e };
                }
            } else {
                return { status: false, user_id: user_id, message: admin_role.message };
            }
        } else {
            role_id = await this.roleService.getRoleByUserType(adminDto.user_type);
        }

        // Create User SignUp
        const user = {
            first_name: adminDto.first_name,
            last_name: adminDto.last_name,
            phone_number: adminDto.phone_number,
            email: adminDto.email,
            role_id: role_id,
            user_type: adminDto.user_type,
            password: adminDto.phone_number,
        }
        let usersignup = await this.authService.signUp(user, transactionSession);

        if (usersignup.status === true) {

            const admin = new Admin();
            admin.admin_id = admin_id;
            admin.user_id = usersignup.user_id;
            admin.first_name = adminDto.first_name;
            admin.last_name = adminDto.last_name;
            admin.email = adminDto.email;
            admin.phone_number = adminDto.phone_number;
            admin.user_type = adminDto.user_type;
            admin.created_at = AppUtils.getIsoUtcMoment();
            admin.updated_at = AppUtils.getIsoUtcMoment();
            admin.created_by = usersignup.user_id;
            admin.updated_by = usersignup.user_id;

            try {
                await this.adminModel.create([admin], { transactionSession });
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

    // GET All Admins list
    async getAdminsList(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        var params: any = { status: 1 };
        if (search) {
            params = {
                $or: [
                    { user_id: { $regex: search } },
                    { first_name: { $regex: search } },
                    { last_name: { $regex: search } },
                    { phone_number: { $regex: search } },
                    { email: { $regex: search } },
                ],
                status: 1
            };
        }
        const count = await this.adminModel.count(params).exec();
        const list = await this.adminModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Admin by Id
    async getAdminById(id: string, loggedInUser: User) {
        const admin = await this.adminModel
            .findOne({ admin_id: id })
            .exec();
        return admin;
    }

    // Update Admin by Id
    async updateAdmin(
        admin_id: string,
        adminDto: AdminDto,
        loggedInUser: User,
    ) {
        const admin = await this.adminModel.findOne({ admin_id }).exec();
        if (!admin) {
            throw new NotFoundException('Admin not found');
        }

        // starting session on mongoose default connection
        // const transactionSession = await this.connection.startSession();
        // transactionSession.startTransaction();

        admin.first_name = adminDto.first_name;
        admin.last_name = adminDto.last_name;
        admin.phone_number = adminDto.phone_number;
        admin.email = adminDto.email;
        admin.user_type = adminDto.user_type;
        admin.updated_at = AppUtils.getIsoUtcMoment();
        admin.updated_by = loggedInUser.user_id;
        try {
            console.log(admin)
            await this.adminModel.updateOne({ admin_id }, admin)
            // await this.adminModel.updateOne([{ admin_id }, {admin}], { transactionSession });
            // await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            // await transactionSession.abortTransaction();
            return { status: true, data: e };
        }
        // } finally {
        //     await transactionSession.endSession();
        // }
    }

    // Delete Admin by Id
    async deleteAdmin(admin_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const admin = await this.adminModel.findOne({ admin_id }).exec();
        if (!admin) {
            throw new NotFoundException('Admin not found');
        }
        try {
            // await this.adminModel.updateOne([{ admin_id }, { status: 0 }], { transactionSession });
            await this.adminModel.updateOne({ admin_id }, { status: 0 });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

    // Restore Admin by Id
    async restoreAdmin(admin_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const admin = await this.adminModel.findOne({ admin_id }).exec();
        if (!admin) {
            throw new NotFoundException('Admin not found');
        }
        try {
            // await this.adminModel.updateOne([{ admin_id }, { status: 0 }], { transactionSession });
            await this.adminModel.updateOne({ admin_id }, { status: 1 });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

}





