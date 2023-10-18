import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Gender } from 'src/enums/gender.enum';
import { UserType } from 'src/enums/user-type.enum';

export class AdminDto {
  @ApiProperty({ example: 'Vinod', description: 'FirstName of the Admin' })
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Kumar', description: 'Last Name of the Admin' })
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: 'Super Admin', description: 'Type of the User' })
  @IsNotEmpty()
  user_type: UserType;

  @ApiProperty({ example: 'vinodkumar@gmail.com', description: 'Email of the Super Admin' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '9848484848', description: 'Contact of the Super Admin' })
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ example: 'Male', description: 'Gender of the Super Admin' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

}
