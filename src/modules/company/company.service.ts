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
import { Company, CompanyDocument } from './schemas/company.schema';
import { User } from '../users/schemas/user.schema';

// Dto
import { CompanyDto } from './dto/company.dto';

// Enums
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { UserType } from 'src/enums/user-type.enum';
import { CompanyType } from 'src/enums/company-type.enum';

// Services
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { UserService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { RoleService } from '../role/role.service';

// Utils\
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class CompanyService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        private autoIncrementService: AutoIncrementService,
        private userservice: UserService,
        private authService: AuthService,
        private roleService: RoleService,
    ) { }

    // Query Company
    async queryCompany(filter: any) {
        const company = await this.companyModel.findOne(filter).exec();
        return company;
    }

    // Add Company
    async addCompany(companyDto: CompanyDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Create Company Id
        const company_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.COMPANY,
            transactionSession,
        );

        var role_id = '';

        // Create Role for the Company
        const Companyrole = {
            entity_id: company_id,
            role: UserType.CompanyOwner,
        }

        const companyuserrole = await this.roleService.addRole(Companyrole, loggedInUser.user_id, transactionSession);

        // Add Permissions to the Company Owner Role
        if (companyuserrole.status === true) {
            role_id = companyuserrole.data;
            var permissions = await this.roleService.companyOwner_permissions();
            try {
                const permission = await this.roleService.addPermission(permissions, role_id, loggedInUser.user_id, transactionSession);
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
            return { status: false, data: companyuserrole.message };
        }

        // Create Role for the Employee
        const Employee_role = {
            entity_id: company_id,
            role: UserType.Employee,
        }
        const employeeuser_role = await this.roleService.addRole(Employee_role, loggedInUser.user_id, transactionSession);

        // Add Permissions to the Employee Role
        if (employeeuser_role.status === true) {
            var permissions = await this.roleService.employee_permissions();
            try {
                const permission = await this.roleService.addPermission(permissions, employeeuser_role.data, loggedInUser.user_id, transactionSession);
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
            return { status: false, message: employeeuser_role.message };
        }

        // Create User SignUp
        const user = {
            first_name: companyDto.first_name,
            last_name: companyDto.last_name,
            phone_number: companyDto.phone_number,
            email: companyDto.email,
            role_id: role_id,
            user_type: UserType.CompanyOwner,
            password: companyDto.phone_number,
        }
        let usersignup = await this.authService.signUp(user, transactionSession);

        if (usersignup.status === true) {
            // Check for Company Name
            const companycheck = await this.companyModel
                .findOne({ company_name: companyDto.company_name, status: 1 })
                .exec();
            if (companycheck) {
                throw new BadRequestException('Company already exists');
            }

            const company = new Company();
            company.company_id = company_id;
            company.user_id = usersignup.user_id;
            company.company_name = companyDto.company_name;
            company.company_type = companyDto.company_type;
            company.email = companyDto.company_email;
            company.contact_number = companyDto.contact_number;
            company.toll_free = companyDto.toll_free;
            company.owner_first_name = companyDto.first_name;
            company.owner_last_name = companyDto.last_name;
            company.owner_phone_number = companyDto.phone_number;
            company.owner_email = companyDto.email;
            company.owner_gender = companyDto.gender;
            company.owner_dob = companyDto.dob;
            company.head_office = companyDto.head_office;
            company.address = companyDto.address;
            company.city = companyDto.city;
            company.state = companyDto.state;
            company.pincode = companyDto.pincode;
            company.created_at = AppUtils.getIsoUtcMoment();
            company.updated_at = AppUtils.getIsoUtcMoment();
            company.created_by = loggedInUser.user_id;
            company.updated_by = loggedInUser.user_id;

            try {
                await this.companyModel.create([company], { transactionSession });
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

    // GET All Companies list
    async getCompanies(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            params.company_name = { $regex: search };
        }
        const count = await this.companyModel.count(params).exec();
        const list = await this.companyModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Company by Id
    async getCompanyById(id: string, loggedInUser: User) {
        const company = await this.companyModel
            .findOne({ company_id: id })
            .exec();
        return company;
    }

    // Update Company by Id
    async updateCompany(
        company_id: string,
        companyDto: CompanyDto,
        loggedInUser: User,
    ) {
        const company = await this.companyModel.findOne({ company_id }).exec();
        if (!company) {
            throw new NotFoundException('Company not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        company.company_name = companyDto.company_name;
        company.email = companyDto.company_email;
        company.contact_number = companyDto.contact_number;
        company.toll_free = companyDto.toll_free;
        company.owner_first_name = companyDto.first_name;
        company.owner_last_name = companyDto.last_name;
        company.owner_phone_number = companyDto.phone_number;
        company.owner_email = companyDto.email;
        company.owner_gender = companyDto.gender;
        company.owner_dob = companyDto.dob;
        company.head_office = companyDto.head_office;
        company.address = companyDto.address;
        company.city = companyDto.city;
        company.state = companyDto.state;
        company.pincode = companyDto.pincode;
        company.updated_at = AppUtils.getIsoUtcMoment();
        company.updated_by = loggedInUser.user_id;
        try {
            await this.companyModel.updateOne({ company_id }, company, { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
    }

    // Delete Company by Id
    async deleteCompany(company_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const company = await this.companyModel.findOne({ company_id }).exec();
        if (!company) {
            throw new NotFoundException('Company not found');
        }

        company.updated_at = AppUtils.getIsoUtcMoment();
        company.updated_by = loggedInUser.user_id;
        company.status = 0;

        try {
            await this.companyModel.updateOne({ company_id }, company, { transactionSession });
            await this.userservice.deleteUser(company.user_id, loggedInUser.user_id, transactionSession);
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

    // Restore Company by Id
    async restoreCompany(company_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const company = await this.companyModel.findOne({ company_id }).exec();
        if (!company) {
            throw new NotFoundException('Company not found');
        }

        company.updated_at = AppUtils.getIsoUtcMoment();
        company.updated_by = loggedInUser.user_id;
        company.status = 1;

        try {
            await this.companyModel.updateOne({ company_id }, company, { transactionSession });
            await this.userservice.restoreUser(company.user_id, loggedInUser.user_id, transactionSession);
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




