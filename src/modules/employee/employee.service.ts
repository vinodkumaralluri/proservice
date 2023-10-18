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
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { Factory, FactoryDocument } from '../factory/schemas/factory.schema';
import { Warehouse, WarehouseDocument } from '../warehouse/schemas/warehouse.schema';
import { Store, StoreDocument } from '../store/schemas/store.schema';
import { ServiceCenter, ServiceCenterDocument } from '../service-center/schemas/service-center.schema';
import { User } from '../users/schemas/user.schema';

// Enum
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { Employee_Service } from 'src/enums/employee-service.enum';
import { UserType } from 'src/enums/user-type.enum';

// Dto
import { EmployeeDto } from './dto/employee.dto';

// Services
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { UserService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { RoleService } from '../role/role.service';

// Utils
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        @InjectModel(Factory.name) private factoryModel: Model<FactoryDocument>,
        @InjectModel(Warehouse.name) private warehouseModel: Model<WarehouseDocument>,
        @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
        @InjectModel(ServiceCenter.name) private servicecenterModel: Model<ServiceCenterDocument>,
        private autoIncrementService: AutoIncrementService,
        private userservice: UserService,
        private authService: AuthService,
        private roleService: RoleService,
    ) { }

    // Query Employee
    async queryEmployee(filter: any) {
        const employee = await this.employeeModel.findOne(filter).exec();
        return employee;
    }

    // Add Employee
    async addEmployee(employeeDto: EmployeeDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Get role
        const role = await this.roleService.getRoleByCompany(employeeDto.company_id, UserType.Employee);

        const user = {
            first_name: employeeDto.first_name,
            last_name: employeeDto.last_name,
            phone_number: employeeDto.phone_number,
            email: employeeDto.email,
            role_id: role.role_id,
            user_type: UserType.Employee,
            password: employeeDto.phone_number,
        }
        let usersignup = await this.authService.signUp(user, transactionSession);

        if (usersignup.status == true) {
            console.log("Hello");
            // Check for Employee Name
            const employeecheck = await this.employeeModel
                .findOne({ first_name: employeeDto.first_name, last_name: employeeDto.last_name, status: 1 })
                .exec();
            if (employeecheck) {
                throw new BadRequestException('Employee already exists');
            }
            // Create Employee Id
            const employee_id = await this.autoIncrementService.getNextSequence(
                AutoIncrementEnum.EMPLOYEE,
            );

            const employee = new Employee();
            employee.employee_id = employee_id;
            employee.user_id = usersignup.user_id;
            employee.first_name = employeeDto.first_name;
            employee.last_name = employeeDto.last_name;
            employee.company_id = employeeDto.company_id;
            employee.employee_code = employeeDto.employee_code;
            employee.employeeservice = employeeDto.employeeservice;
            employee.service_id = employeeDto.service_id;
            employee.role_id = role.role_id;
            employee.qualification = employeeDto.qualification;
            employee.gender = employeeDto.gender;
            employee.date_of_birth = employeeDto.date_of_birth;
            employee.date_of_joining = employeeDto.date_of_joining;
            employee.created_at = AppUtils.getIsoUtcMoment();
            employee.updated_at = AppUtils.getIsoUtcMoment();
            employee.created_by = loggedInUser.user_id;
            employee.updated_by = loggedInUser.user_id;

            try {
                await this.employeeModel.create([employee], { transactionSession });

                await this.companyModel.updateOne({ company_id: employeeDto.company_id }, { $inc: { employees: 1 } }, { transactionSession });

                if (employeeDto.employeeservice === Employee_Service.Factory) {
                    await this.factoryModel.updateOne({ company_id: employeeDto.company_id }, { $inc: { employees: 1 } }, { transactionSession })
                } else if (employeeDto.employeeservice === Employee_Service.Warehouse) {
                    await this.warehouseModel.updateOne({ company_id: employeeDto.company_id }, { $inc: { employees: 1 } }, { transactionSession })
                } else if (employeeDto.employeeservice === Employee_Service.Store) {
                    await this.storeModel.updateOne({ company_id: employeeDto.company_id }, { $inc: { employees: 1 } }, { transactionSession })
                } else if (employeeDto.employeeservice === Employee_Service.ServiceCenter) {
                    await this.servicecenterModel.updateOne({ company_id: employeeDto.company_id }, { $inc: { employees: 1 } }, { transactionSession })
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
    }

    // GET All Employees list
    async getEmployees(
        loggedInUser: User,
        company_id: string,
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
                    { employee_code: { $regex: search } },
                ],
                company_id: company_id,
                status: 1,
            };
        } else {
            params = { company_id: company_id, status: 1 };
        }
        const count = await this.employeeModel.count(params).exec();
        const list = await this.employeeModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Employee by Id
    async getEmployeeById(id: string, loggedInUser: User) {
        const employee = await this.employeeModel
            .findOne({ employee_id: id })
            .exec();
        return employee;
    }

    // Update Employee by Id
    async updateEmployee(
        employee_id: string,
        employeeDto: EmployeeDto,
        loggedInUser: User,
    ) {
        const employee = await this.employeeModel.findOne({ employee_id }).exec();
        if (!employee) {
            throw new NotFoundException('Employee not found');
        }
        employee.first_name = employeeDto.first_name;
        employee.last_name = employeeDto.last_name;
        employee.company_id = employeeDto.company_id;
        employee.employee_code = employeeDto.employee_code;
        employee.employeeservice = employeeDto.employeeservice;
        employee.service_id = employeeDto.service_id;
        employee.role_id = employeeDto.role_id;
        employee.qualification = employeeDto.qualification;
        employee.gender = employeeDto.gender;
        employee.date_of_birth = employeeDto.date_of_birth;
        employee.date_of_joining = employeeDto.date_of_joining;
        employee.updated_at = AppUtils.getIsoUtcMoment();
        employee.updated_by = loggedInUser.user_id;
        return this.employeeModel.updateOne({ employee_id }, employee);
    }

    // Delete Employee by Id
    async deleteEmployee(employee_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const employee = await this.employeeModel.findOne({ employee_id }).exec();
        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        employee.updated_at = AppUtils.getIsoUtcMoment();
        employee.updated_by = loggedInUser.user_id;
        employee.status = 0;

        try {
            await this.employeeModel.updateOne({ employee_id }, employee, { transactionSession });
            await this.userservice.deleteUser(employee.user_id, loggedInUser.user_id, transactionSession);
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

    // Restore Employee by Id
    async restoreEmployee(employee_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const employee = await this.employeeModel.findOne({ employee_id }).exec();
        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        employee.updated_at = AppUtils.getIsoUtcMoment();
        employee.updated_by = loggedInUser.user_id;
        employee.status = 1;

        try {
            await this.employeeModel.updateOne({ employee_id }, employee, { transactionSession });
            await this.userservice.restoreUser(employee.user_id, loggedInUser.user_id, transactionSession);
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

}
