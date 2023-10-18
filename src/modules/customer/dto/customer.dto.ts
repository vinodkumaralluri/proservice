import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Gender } from 'src/enums/gender.enum';

export class CustomerDto {

    @ApiProperty({ example: 'John', description: 'First Name of the Customer' })
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ example: 'Jacobs', description: 'Last Name of the Customer' })
    last_name: string;

    @ApiProperty({ example: '8962623232', description: 'Phone number of the Customer' })
    phone_number: string;

    @ApiProperty({ example: 'customer1@gmail.com', description: 'Email id of the Customer' })
    email: string;

    @ApiProperty({ example: 'Hyderabad', description: 'City of the Customer' })
    city: string;

    @ApiProperty({ example: 'Telangana', description: 'State of the Employee' })
    state: string;

    @ApiProperty({ example: '500089', description: 'Pincode of the Employee' })
    pincode: string;

    @ApiProperty({ example: 'Male', description: 'Gender of the Employee' })
    @IsEnum(Gender)
    gender: Gender;

}
