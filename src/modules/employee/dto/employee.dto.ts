import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EmployeeQualification } from 'src/enums/employee-qualification.enum';
import { Gender } from 'src/enums/gender.enum';
import { Employee_Service } from '../../../enums/employee-service.enum';

export class EmployeeDto {

    @ApiProperty({ example: 'John', description: 'First Name of the Employee' })
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ example: 'Jacobs', description: 'Last Name of the Employee' })
    last_name: string;

    @ApiProperty({ example: 'C1', description: 'Company Id of the Employee' })
    @IsNotEmpty()
    company_id: string;

    @ApiProperty({ example: 'EMP1234', description: 'Employee Code of the Employee' })
    employee_code: string;

    @ApiProperty({ example: '8962623232', description: 'Phone number of the Employee' })
    phone_number: string;

    @ApiProperty({ example: 'employee1@gmail.com', description: 'Email id of the Employee' })
    email: string;

    @ApiProperty({ example: 'Store', description: 'Service of the Employee in the Company' })
    @IsEnum(Employee_Service)
    employeeservice: Employee_Service;

    @ApiProperty({ example: 'ST12', description: 'Id of the Service' })
    service_id: string;

    @ApiProperty({ example: 'CR1', description: 'Role of the Employee in the Company' })
    @IsNotEmpty()
    role_id: string;

    @ApiProperty({ example: 'Graduation', description: 'Qualification of the Employee' })
    @IsEnum(EmployeeQualification)
    qualification: EmployeeQualification;

    @ApiProperty({ example: 'Male', description: 'Gender of the Employee' })
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({ example: '18/01/1993', description: 'Date of Birth of the Employee' })
    date_of_birth: string;

    @ApiProperty({ example: 'CR1', description: 'Date of joining of the Employee' })
    date_of_joining: string;

}
