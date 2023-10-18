import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserType } from '../../../enums/user-type.enum';

export class UpdateUserDto {
  @ApiProperty({ example: '984293739', description: 'Phone Number' })
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ example: 'john@john.com', description: 'Email' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'true', description: '2 Factor authentication' })
  is2FaEnabled: boolean;
}
