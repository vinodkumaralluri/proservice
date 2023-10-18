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
import { TransformInterceptor } from '../../../core/transform.interceptor';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { DeliveryDto } from '../dto/delivery.dto';
import { LocationDto } from '../../location/dto/location.dto';
import { DeliveryService } from './delivery.service';

@Controller({
    path: 'delivery',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Delivery')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class DeliveryController {
    constructor(private readonly deliveryservice: DeliveryService) { }

    // Add Delivery
    @Post('/addDelivery')
    @ApiOperation({ summary: 'Add Delivery' })
    @ApiOkResponse({
        description: 'Delivery added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addDelivery(@Body() deliveryDto: DeliveryDto, @Request() req) {
        const delivery = await this.deliveryservice.addDelivery(
            deliveryDto,
            req.user,
        );
        if (delivery.status == true) {
            return { message: 'Delivery added successfully' };
        } else {
            throw new NotImplementedException(delivery.data);
        }
    }

    // Update Delivery
    @Put('/editDelivery/:delivery_id')
    @ApiOperation({ summary: 'Update Delivery' })
    @ApiOkResponse({
        description: 'Delivery updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateDelivery(
        @Request() req,
        @Param('delivery_id') delivery_id: string,
        @Body() deliveryDto: DeliveryDto,
    ) {
        await this.deliveryservice.updateDelivery(
            delivery_id,
            deliveryDto,
            req.user,
        );
        return { message: 'Delivery updated successfully', data: true };
    }

    // GET All Deliveries list
    @Get('/getDeliveries/:user_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Deliveries' })
    @ApiOkResponse({
        description: 'Deliveries fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getDeliveries(
        @Request() req,
        @Param('user_id') user_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const deliveries = await this.deliveryservice.getDeliveries(
            req.user,
            user_id,
            page,
            limit,
            search,
        );
        return { message: 'Deliveries fetched successfully', data: deliveries };
    }

    // GET Delivery by Id
    @Get('/getDeliveryById/:delivery_id')
    @ApiOperation({ summary: 'Get Delivery By Id' })
    @ApiOkResponse({
        description: 'Delivery fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getDeliveryById(
        @Request() req,
        @Param('delivery_id') delivery_id: string,
    ) {
        const delivery = await this.deliveryservice.getDeliveryById(
            delivery_id,
            req.user,
        );
        return { message: 'Delivery fetched successfully', data: delivery };
    }

    // Update Delivery Live Location
    @Put('/updateLiveLocation/:delivery_id')
    @ApiOperation({ summary: 'Update Delivery Live Location' })
    @ApiOkResponse({
        description: 'Delivery Live Location updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateLiveLocation(
        @Request() req,
        @Param('delivery_id') delivery_id: string,
        @Body() locationDto: LocationDto,
    ) {
        await this.deliveryservice.updateLiveLocation(
            delivery_id,
            locationDto,
            req.user,
        );
        return { message: 'Delivery Live Location updated successfully', data: true };
    }

    // Start Delivery
    @Put('/startDelivery/:delivery_id')
    @ApiOperation({ summary: 'Started Delivery' })
    @ApiOkResponse({
        description: 'Delivery Started successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async startDelivery(
        @Request() req,
        @Param('delivery_id') delivery_id: string,
    ) {
        await this.deliveryservice.startDelivery(
            delivery_id,
            req.user.user_id,
        );
        return { message: 'Delivery Started successfully', data: true };
    }

    // Complete Delivery
    @Put('/completeDelivery/:delivery_id')
    @ApiOperation({ summary: 'Completed the Delivery' })
    @ApiOkResponse({
        description: 'Delivery Completed successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async completeDelivery(
        @Request() req,
        @Param('delivery_id') delivery_id: string,
    ) {
        await this.deliveryservice.completeDelivery(
            delivery_id,
            req.user.user_id,
        );
        return { message: 'Delivery completed successfully', data: true };
    }

    // Add Item to the Delivery
    @Put('/addItemToDelivery/:delivery_id')
    @ApiOperation({ summary: 'Add Item to the Delivery' })
    @ApiOkResponse({
        description: 'Item added to the Delivery successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addItemToDelivery(
        @Request() req,
        @Param('delivery_id') delivery_id: string,
        @Body() deliveryitemDto: any,
    ) {
        await this.deliveryservice.addItemToDelivery(
            delivery_id,
            deliveryitemDto,
            req.user.user_id,
        );
        return { message: 'Item added to the Delivery successfully', data: true };
    }

    // Complete Item Delivery
    @Put('/completeItemDelivery/:delivery_id')
    @ApiOperation({ summary: 'Completed the Item Delivery' })
    @ApiOkResponse({
        description: 'Item Delivery Completed successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async completeItemDelivery(
        @Request() req,
        @Param('delivery_id') delivery_id: string,
        @Body() deliveryitemDto: any,
    ) {
        await this.deliveryservice.completeItemDelivery(
            delivery_id,
            deliveryitemDto,
            req.user.user_id,
        );
        return { message: 'Delivery completed successfully', data: true };
    }

    // Delete Delivery
    @Delete('/deleteDelivery/:delivery_id')
    @ApiOperation({ summary: 'Delete Delivery' })
    @ApiOkResponse({
        description: 'Delivery deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteDelivery(@Request() req, @Param('delivery_id') delivery_id: string) {
        await this.deliveryservice.deleteDelivery(
            delivery_id,
            req.user,
        );
        return { message: 'Delivery deleted successfully', data: true };
    }

    // Restore Delivery
    @Delete('/restoreDelivery/:delivery_id')
    @ApiOperation({ summary: 'Restore Delivery' })
    @ApiOkResponse({
        description: 'Delivery restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreDelivery(
        @Request() req,
        @Param('delivery_id') delivery_id: string,
    ) {
        await this.deliveryservice.restoreDelivery(
            delivery_id,
            req.user,
        );
        return { message: 'Delivery restored successfully', data: true };
    }
}
