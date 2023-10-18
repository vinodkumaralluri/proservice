import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { AppConstant } from '../../utils/app.constants';
import { AppUtils } from '../../utils/app.utils';
import { Role, RoleDocument } from './schemas/role.schema';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { RoleDto } from './dto/role.dto';
import { PermissionDto } from './dto/permission.dto';
import { User } from '../users/schemas/user.schema';
import { UserType } from 'src/enums/user-type.enum';
import * as mongoose from 'mongoose';
import { ModuleType } from 'src/enums/module-type.enum';
import { PermissionType } from 'src/enums/permission.enum';

@Injectable()
export class RoleService {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
        @InjectConnection() private readonly connection: mongoose.Connection,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Role
    async queryRole(filter: any) {
        const role = await this.roleModel.findOne(filter).exec();
        return role;
    }

    // Add Role
    async addRole(
        roleDto: RoleDto,
        user_id: string,
        session: mongoose.ClientSession | null = null
    ) {
        // Check for Role
        const rolecheck = await this.roleModel
            .findOne({ entity_id: roleDto.entity_id, role: roleDto.role, status: 1 })
            .exec();
        if (rolecheck) {
            console.log(rolecheck)
            throw new BadRequestException('Role already exists');
        }
        // Create Company Role Id
        const role_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.ROLE,
            session
        );
        const role = new Role();
        role.role_id = role_id;
        role.entity_id = roleDto.entity_id;
        role.role = roleDto.role;
        role.created_at = AppUtils.getIsoUtcMoment();
        role.updated_at = AppUtils.getIsoUtcMoment();
        role.created_by = user_id;
        role.updated_by = user_id;
        try {
            await this.roleModel.create([role], { session });
            return { status: true, data: role_id, message: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.ROLE);
            return { status: false, data: e, message: 'failure' };
        }
    }

    // GET All Role list
    async getRoles(
        loggedInUser: User,
        entity_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { entity_id: entity_id, status: 1 };
        if (search) {
            params.role = { $regex: search };
        }
        const count = await this.roleModel.count(params).exec();
        const list = await this.roleModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Role by Id
    async getRoleById(id: string, loggedInUser: User) {
        const role = await this.roleModel
            .findOne({ role_id: id })
            .exec();
        return role;
    }

    // GET Role by Company
    async getRoleByCompany(entity_id: string, usertype: UserType) {
        const role = await this.roleModel
            .findOne({ entity_id: entity_id, role: usertype, status: 1 })
            .exec();
        return role;
    }

    // GET Role by User Type
    async getRoleByUserType(user_type: UserType) {
        const role = await this.roleModel.findOne({ role: user_type, status: 1 }).exec();
        return role.role_id;
    }

    // Update Role by Id
    async updateRole(
        role_id: string,
        roleDto: RoleDto,
        loggedInUser: User,
    ) {
        const role = await this.roleModel.findOne({ role_id }).exec();
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        role.entity_id = roleDto.entity_id;
        role.role = roleDto.role;
        role.updated_at = AppUtils.getIsoUtcMoment();
        role.updated_by = loggedInUser.user_id;
        return this.roleModel.updateOne({ role_id }, role);
    }

    // Delete Role by Id
    async deleteRole(role_id: string, loggedInUser: User) {
        const role = await this.roleModel.findOne({ role_id }).exec();
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        await this.roleModel.updateOne({ role_id }, { status: 0 });
        return;
    }

    // Restore Role by Id
    async restoreRole(role_id: string, loggedInUser: User) {
        const role = await this.roleModel.findOne({ role_id }).exec();
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        await this.roleModel.updateOne({ role_id }, { status: 1 });
        return;
    }

    // Query Company
    async queryPermission(filter: any) {
        const permission = await this.permissionModel.findOne(filter).exec();
        return permission;
    }

    // Add Permission
    async addPermission(
        permissions: any[],
        role_id: string,
        user_id: string,
        session: mongoose.ClientSession | null = null
    ) {
        // Check for Permission
        const permissioncheck = await this.permissionModel
            .findOne({ module_permissions: permissions, role_id: role_id, status: 1 })
            .exec();
        if (permissioncheck) {
            throw new BadRequestException('Permissions already exists');
        }
        // Create Permission Id
        const permission_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.PERMISSION,
            session
        );
        const permission = new Permission();
        permission.permission_id = permission_id;
        permission.role_id = role_id;
        permission.module_permissions = permissions;
        permission.created_at = AppUtils.getIsoUtcMoment();
        permission.updated_at = AppUtils.getIsoUtcMoment();
        permission.created_by = user_id;
        permission.updated_by = user_id;
        try {
            await this.permissionModel.create([permission], { session });
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.PERMISSION);
            return { status: false, data: e };
        }
    }

    // GET All Permissions by Role
    async getPermissions(
        loggedInUser: User,
        role_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { role_id: role_id, status: 1 };
        if (search) {
            params.permission = { $regex: search };
        }
        const count = await this.permissionModel.count(params).exec();
        const list = await this.permissionModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Permission by Id
    async getPermissionById(id: string, loggedInUser: User) {
        const permission = await this.permissionModel
            .findOne({ permission_id: id })
            .exec();
        return permission;
    }

    // Update Permission by Id
    async updatePermission(
        permission_id: string,
        permissions: any[],
        loggedInUser: User,
    ) {
        const permission = await this.permissionModel.findOne({ permission_id }).exec();
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        permission.module_permissions = permissions;
        permission.updated_at = AppUtils.getIsoUtcMoment();
        permission.updated_by = loggedInUser.user_id;
        return this.permissionModel.updateOne({ permission_id }, permission);
    }

    // Delete Permission by Id
    async deletePermission(permission_id: string, loggedInUser: User) {
        const permission = await this.permissionModel.findOne({ permission_id }).exec();
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        await this.permissionModel.updateOne({ permission_id }, { status: 0 });
        return;
    }

    // Restore Permission by Id
    async restorePermission(permission_id: string, loggedInUser: User) {
        const permission = await this.permissionModel.findOne({ permission_id }).exec();
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        await this.permissionModel.updateOne({ permission_id }, { status: 1 });
        return;
    }

    // GET Super Admin Permissions
    async superadmin_permissions() {
        const permissions = [
            {
                module: ModuleType.Company,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Factory,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Warehouse,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Distributor,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Retailer,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Complaint,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Customer,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Employee,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Item,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Model,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Product,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Purchase,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Rating,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Review,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.ServiceCenter,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Store,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Task,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
            {
                module: ModuleType.Warranty,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.VIEW, PermissionType.DELETE]
            },
        ];

        return permissions;
    }

    // GET Admin Permissions
    async admin_permissions() {
        const permissions = [
            {
                module: ModuleType.Company,
                permissions: [PermissionType.VIEW]
            },
            {
                module: ModuleType.Factory,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Warehouse,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Distributor,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Retailer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Complaint,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Customer,
                permissions: [PermissionType.CREATE, PermissionType.VIEW]
            },
            {
                module: ModuleType.Employee,
                permissions: [PermissionType.CREATE, PermissionType.VIEW]
            },
            {
                module: ModuleType.Item,
                permissions: [PermissionType.VIEW]
            },
            {
                module: ModuleType.Model,
                permissions: [PermissionType.VIEW]
            },
            {
                module: ModuleType.Product,
                permissions: [PermissionType.VIEW]
            },
            {
                module: ModuleType.Purchase,
                permissions: [PermissionType.VIEW]
            },
            {
                module: ModuleType.Rating,
                permissions: [PermissionType.VIEW]
            },
            {
                module: ModuleType.Review,
                permissions: [PermissionType.VIEW]
            },
            {
                module: ModuleType.ServiceCenter,
                permissions: [PermissionType.VIEW]
            },
            {
                module: ModuleType.Store,
                permissions: [PermissionType.VIEW]
            },
            {
                module: ModuleType.Task,
                permissions: [PermissionType.VIEW]
            },
            {
                module: ModuleType.Warranty,
                permissions: [PermissionType.VIEW]
            },
        ];

        return permissions;
    }

    // GET Company Owner Permissions
    async companyOwner_permissions() {
        const permissions = [
            {
                module: ModuleType.Company,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Factory,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Warehouse,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Distributor,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Retailer,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Complaint,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Customer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Employee,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Item,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Model,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Product,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Purchase,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Rating,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Review,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.ServiceCenter,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Store,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Task,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Warranty,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
        ];

        return permissions;
    }

    // GET Employee Permissions
    async employee_permissions() {
        const permissions = [
            {
                module: ModuleType.Company,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Factory,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Warehouse,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Distributor,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Retailer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Complaint,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Customer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Employee,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Item,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Model,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Product,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Purchase,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Rating,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Review,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.ServiceCenter,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Store,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Task,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Warranty,
                permissions: [PermissionType.VIEW],
            },
        ];

        return permissions;
    }

    // GET Factory Incharge Permissions
    async factoryincharge_permissions() {
        const permissions = [
            {
                module: ModuleType.Company,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Factory,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Warehouse,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Distributor,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Retailer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Complaint,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Customer,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Employee,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Item,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Model,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Product,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Purchase,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Rating,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Review,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.ServiceCenter,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Store,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Task,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Warranty,
                permissions: [PermissionType.VIEW],
            },
        ];

        return permissions;
    }

    // GET Warehouse Incharge Permissions
    async warehouseincharge_permissions() {
        const permissions = [
            {
                module: ModuleType.Company,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Factory,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Warehouse,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Distributor,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Retailer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Complaint,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Customer,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Employee,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Item,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Model,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Product,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Purchase,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Rating,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Review,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.ServiceCenter,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Store,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Task,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Warranty,
                permissions: [PermissionType.VIEW],
            },
        ];

        return permissions;
    }

    // GET Store Incharge Permissions
    async storeincharge_permissions() {
        const permissions = [
            {
                module: ModuleType.Company,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Factory,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Warehouse,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Distributor,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Retailer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Complaint,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Customer,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Employee,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Item,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Model,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Product,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Purchase,
                permissions: [PermissionType.CREATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Rating,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Review,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.ServiceCenter,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Store,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Task,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Warranty,
                permissions: [PermissionType.VIEW],
            },
        ];

        return permissions;
    }

    // GET Service Center Incharge Permissions
    async servicecenterincharge_permissions() {
        const permissions = [
            {
                module: ModuleType.Company,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Factory,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Warehouse,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Distributor,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Retailer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Complaint,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Customer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Employee,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Item,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Model,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Product,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Purchase,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Rating,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Review,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.ServiceCenter,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Store,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Task,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Warranty,
                permissions: [PermissionType.VIEW],
            },
        ];

        return permissions;
    }

    // GET Distributor Permissions
    async distributor_permissions() {
        const permissions = [
            {
                module: ModuleType.Company,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Factory,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Warehouse,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Distributor,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Retailer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Complaint,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Customer,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Employee,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Item,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Model,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Product,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Purchase,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Rating,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Review,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.ServiceCenter,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Store,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Task,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Warranty,
                permissions: [PermissionType.VIEW],
            },
        ];

        return permissions;
    }

    // GET Retailer Permissions
    async retailer_permissions() {
        const permissions = [
            {
                module: ModuleType.Company,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Factory,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Warehouse,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Distributor,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Retailer,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Complaint,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Customer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Employee,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Item,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Model,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Product,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Purchase,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Rating,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Review,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.ServiceCenter,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Store,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Task,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Warranty,
                permissions: [PermissionType.VIEW],
            },
        ];

        return permissions;
    }

    // GET Customer Permissions
    async customer_permissions() {
        const permissions = [
            {
                module: ModuleType.Company,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Factory,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Warehouse,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Distributor,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Retailer,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Complaint,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Customer,
                permissions: [PermissionType.UPDATE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Employee,
                permissions: [PermissionType.NOACCESS],
            },
            {
                module: ModuleType.Item,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Model,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Product,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Purchase,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Rating,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.Review,
                permissions: [PermissionType.CREATE, PermissionType.UPDATE, PermissionType.DELETE, PermissionType.VIEW],
            },
            {
                module: ModuleType.ServiceCenter,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Store,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Task,
                permissions: [PermissionType.VIEW],
            },
            {
                module: ModuleType.Warranty,
                permissions: [PermissionType.VIEW],
            },
        ];

        return permissions;
    }

}
