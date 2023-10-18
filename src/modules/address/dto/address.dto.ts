import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EntityType } from 'src/enums/entity-type.enum';

export class AddressDto {

    @ApiProperty({ example: 'C1', description: 'Id of the Company of the Address' })
    @IsNotEmpty()
    company_id: string;

    @ApiProperty({ example: 'W1', description: 'Id of the Entity of the Address' })
    @IsNotEmpty()
    entity_id: string;

    @ApiProperty({ example: 'Company', description: 'Entity of the Address' })
    @IsEnum(EntityType)
    @IsNotEmpty()
    entity_type: EntityType;

    @ApiProperty({ example: '1-96', description: 'House number of the Address' })
    house_no: string;

    @ApiProperty({ example: '318', description: 'Plot number of the Address' })
    plot_no: string;

    @ApiProperty({ example: 'Near Gandhi Statue', description: 'Landmark of the Address' })
    landmark: string;

    @ApiProperty({ example: 'Sivaji nagar street', description: 'Street name of the Address' })
    street: string;

    @ApiProperty({ example: 'Prashanthi Hills Colony', description: 'Area of the Address' })
    area: string;

    @ApiProperty({ example: 'Hyderabad', description: 'City of the Address' })
    city: string;

    @ApiProperty({ example: 'Rangareddy district', description: 'District of the Address' })
    disrtrict: string;

    @ApiProperty({ example: 'Telangana', description: 'State of the Address' })
    state: string;

    @ApiProperty({ example: '500089', description: 'Pincode of the Address' })
    pincode: string;

    @ApiProperty({ example: 'AP35HG9693', description: 'Vehicle Number' })
    @IsNotEmpty()
    latitude: string;

    @ApiProperty({ example: 'COM1', description: 'Vehicle Owner Name' })
    @IsNotEmpty()
    longitude: string;

}
