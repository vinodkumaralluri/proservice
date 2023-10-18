import {
    Body,
    Controller,
    Param,
    Post,
    Put,
    Delete,
    UseGuards,
    UseInterceptors,
    Request,
    Get,
    Query,
    NotImplementedException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { TransformInterceptor } from '../../core/transform.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressDto } from './dto/address.dto';
import { AddressService } from './address.service';

@Controller({
    path: 'address',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Address')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class AddressController {
    constructor(private readonly addressservice: AddressService) { }

    // Add Address
    @Post('/addAddress')
    @ApiOperation({ summary: 'Add Address' })
    @ApiOkResponse({
        description: 'Address added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addAddress(@Body() addressDto: AddressDto, @Request() req) {
        const address = await this.addressservice.addAddress(
            addressDto,
            req.user.user_id,
        );
        if (address.status == true) {
            return { message: 'Address added successfully' };
        } else {
            throw new NotImplementedException(address.data);
        }
    }

    // Update Address
    @Put('/editAddress/:address_id')
    @ApiOperation({ summary: 'Update Address' })
    @ApiOkResponse({
        description: 'Address updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateAddress(
        @Request() req,
        @Param('address_id') address_id: string,
        @Body() addressDto: AddressDto,
    ) {
        await this.addressservice.updateAddress(
            address_id,
            addressDto,
            req.user,
        );
        return { message: 'Address updated successfully', data: true };
    }

    // GET All Addresses list of the Entity
    @Get('/getAddressesByEntity/:entity_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Addresses' })
    @ApiOkResponse({
        description: 'Addresses fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getAddressesByEntity(
        @Request() req,
        @Param('entity_id') entity_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const addresses = await this.addressservice.getAddressesByEntity(
            req.user,
            entity_id,
            page,
            limit,
            search,
        );
        return { message: 'Addresses fetched successfully', data: addresses };
    }

    // GET Address by Id
    @Get('/getAddressById/:address_id')
    @ApiOperation({ summary: 'Get Address By Id' })
    @ApiOkResponse({
        description: 'Address fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getAddressById(
        @Request() req,
        @Param('address_id') address_id: string,
    ) {
        const address = await this.addressservice.getAddressById(
            address_id,
            req.user,
        );
        return { message: 'Address fetched successfully', data: address };
    }

    // Delete Address
    @Delete('/deleteAddress/:address_id')
    @ApiOperation({ summary: 'Delete Address' })
    @ApiOkResponse({
        description: 'Address deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteAddress(@Request() req, @Param('address_id') address_id: string) {
        await this.addressservice.deleteAddress(
            address_id,
            req.user,
        );
        return { message: 'Address deleted successfully', data: true };
    }

    // Restore Address
    @Delete('/restoreAddress/:address_id')
    @ApiOperation({ summary: 'Restore Address' })
    @ApiOkResponse({
        description: 'Address restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreAddress(
        @Request() req,
        @Param('address_id') address_id: string,
    ) {
        await this.addressservice.restoreAddress(
            address_id,
            req.user,
        );
        return { message: 'Address restored successfully', data: true };
    }
}



