import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EntityType } from 'src/enums/entity-type.enum';
import { Operation } from 'src/enums/operation.enum';

export class ItemTransactionDto {

    @ApiProperty({ example: 'IT1', description: 'Item Id' })
    @IsNotEmpty()
    item_id: string;

    @ApiProperty({ example: 'M12', description: 'Model Id' })
    @IsNotEmpty()
    @IsEnum(Operation)
    operation: Operation;

    @ApiProperty({ example: 'dfbsfv23263232', description: 'Serial number of the Product Item' })
    @IsNotEmpty()
    item_hash: string;

    @ApiProperty({ example: 'dfbsfv23263232', description: 'Serial number of the Product Item' })
    @IsNotEmpty()
    @IsEnum(EntityType)
    source: EntityType;

    @ApiProperty({ example: 'dfbsfv23263232', description: 'Serial number of the Product Item' })
    @IsNotEmpty()
    source_id: string;

    @ApiProperty({ example: 'dfbsfv23263232', description: 'Serial number of the Product Item' })
    @IsNotEmpty()
    @IsEnum(EntityType)
    destination: EntityType;

    @ApiProperty({ example: 'dfbsfv23263232', description: 'Serial number of the Product Item' })
    @IsNotEmpty()
    destination_id: string;

}
