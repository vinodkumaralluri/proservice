import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Gender } from 'src/enums/gender.enum';
import { CompanyType } from 'src/enums/company-type.enum';

export class CompanyDto {
  @ApiProperty({ example: 'Philips', description: 'Name of the Company' })
  @IsNotEmpty()
  company_name: string;
  
  @ApiProperty({ example: 'Manufacturer', description: 'Type of the Company' })
  @IsNotEmpty()
  @IsEnum(CompanyType)
  company_type: CompanyType;

  @ApiProperty({ example: 'philips@gmail.com', description: 'Email of the Company' })
  @IsNotEmpty()
  company_email: string;

  @ApiProperty({ example: '9848484848', description: 'Contact of the Company' })
  @IsNotEmpty()
  contact_number: string;

  @ApiProperty({ example: '1800125365', description: 'Toll Free number of the company' })
  @IsNotEmpty()
  toll_free: string;

  @ApiProperty({ example: 'New Delhi', description: 'Head Office of the Company' })
  @IsNotEmpty()
  head_office: string;

  @ApiProperty({ example: 'Dwaraka nagar', description: 'Address of the Company' })
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Hyderabad', description: 'City of the Company' })
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Telangana', description: 'State of the Company' })
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '500089', description: 'Pincode of the Company' })
  @IsNotEmpty()
  pincode: string;

  @ApiProperty({ example: 'Philips', description: 'First Name of the Company Owner' })
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Philips', description: 'Last Name of the Company Owner' })
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: '9846859647', description: 'Phone Number of the Company Owner' })
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ example: 'email@philips.com', description: 'Email of the Company Owner' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Male', description: 'Gender of the Company Owner' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ example: '18/11/1956', description: 'Date of Birth of the Company Owner' })
  @IsNotEmpty()
  dob: string;

}
