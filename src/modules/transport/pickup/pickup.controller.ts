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
import { PickupDto } from '../dto/pickup.dto';
import { LocationDto } from '../../location/dto/location.dto';
import { PickupService } from './pickup.service';

@Controller({
    path: 'pickup',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Pickup')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class PickupController {
    constructor(private readonly pickupservice: PickupService) { }

    // Add Pickup
    @Post('/addPickup')
    @ApiOperation({ summary: 'Add Pickup' })
    @ApiOkResponse({
        description: 'Pickup added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addPickup(@Body() pickupDto: PickupDto, @Request() req) {
        const pickup = await this.pickupservice.addPickup(
            pickupDto,
            req.user,
        );
        if (pickup.status == true) {
            return { message: 'Pickup added successfully' };
        } else {
            throw new NotImplementedException(pickup.data);
        }
    }

    // Update Pickup
    @Put('/editPickup/:pickup_id')
    @ApiOperation({ summary: 'Update Pickup' })
    @ApiOkResponse({
        description: 'Pickup updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updatePickup(
        @Request() req,
        @Param('pickup_id') pickup_id: string,
        @Body() pickupDto: PickupDto,
    ) {
        await this.pickupservice.updatePickup(
            pickup_id,
            pickupDto,
            req.user,
        );
        return { message: 'Pickup updated successfully', data: true };
    }

    // GET All pickups list
    @Get('/getpickups/:user_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Pickups' })
    @ApiOkResponse({
        description: 'Pickups fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getPickups(
        @Request() req,
        @Param('user_id') user_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const pickups = await this.pickupservice.getPickups(
            req.user,
            user_id,
            page,
            limit,
            search,
        );
        return { message: 'Pickups fetched successfully', data: pickups };
    }

    // GET Pickup by Id
    @Get('/getPickupById/:pickup_id')
    @ApiOperation({ summary: 'Get Pickup By Id' })
    @ApiOkResponse({
        description: 'Pickup fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getPickupById(
        @Request() req,
        @Param('pickup_id') pickup_id: string,
    ) {
        const pickup = await this.pickupservice.getPickupById(
            pickup_id,
            req.user,
        );
        return { message: 'Pickup fetched successfully', data: pickup };
    }

    // Update Pickup Live Location
    @Put('/updatePickupLiveLocation/:pickup_id')
    @ApiOperation({ summary: 'Update Pickup Live Location' })
    @ApiOkResponse({
        description: 'Pickup Live Location updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updatePickupLiveLocation(
        @Request() req,
        @Param('pickup_id') pickup_id: string,
        @Body() locationDto: LocationDto,
    ) {
        await this.pickupservice.updatePickupLiveLocation(
            pickup_id,
            locationDto,
            req.user,
        );
        return { message: 'Pickup Live Location updated successfully', data: true };
    }

    // Start Pickup
    @Put('/startPickup/:pickup_id')
    @ApiOperation({ summary: 'Started Pickup' })
    @ApiOkResponse({
        description: 'Pickup Started successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async startPickup(
        @Request() req,
        @Param('pickup_id') pickup_id: string,
    ) {
        await this.pickupservice.startPickup(
            pickup_id,
            req.user.user_id,
        );
        return { message: 'Pickup Started successfully', data: true };
    }

    // Complete Pickup
    @Put('/completePickup/:pickup_id')
    @ApiOperation({ summary: 'Completed the Pickup' })
    @ApiOkResponse({
        description: 'Pickup Completed successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async completePickup(
        @Request() req,
        @Param('pickup_id') pickup_id: string,
    ) {
        await this.pickupservice.completePickup(
            pickup_id,
            req.user.user_id,
        );
        return { message: 'Pickup completed successfully', data: true };
    }

    // Add Item to the Pickup
    @Put('/addItemToPickup/:pickup_id')
    @ApiOperation({ summary: 'Add Item to the Pickup' })
    @ApiOkResponse({
        description: 'Item added to the Pickup successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addItemToPickup(
        @Request() req,
        @Param('pickup_id') pickup_id: string,
        @Body() pickupitemDto: any,
    ) {
        await this.pickupservice.addItemToPickup(
            pickup_id,
            pickupitemDto,
            req.user.user_id,
        );
        return { message: 'Item added to the Pickup successfully', data: true };
    }

    // Complete Item Pickup
    @Put('/completeItemPickup/:pickup_id')
    @ApiOperation({ summary: 'Completed the Item Pickup' })
    @ApiOkResponse({
        description: 'Item Pickup Completed successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async completeItemPickup(
        @Request() req,
        @Param('pickup_id') pickup_id: string,
        @Body() pickupitemDto: any,
    ) {
        await this.pickupservice.completeItemPickup(
            pickup_id,
            pickupitemDto,
            req.user.user_id,
        );
        return { message: 'Pickup completed successfully', data: true };
    }

    // Delete Pickup
    @Delete('/deletePickup/:pickup_id')
    @ApiOperation({ summary: 'Delete Pickup' })
    @ApiOkResponse({
        description: 'Pickup deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deletePickup(@Request() req, @Param('pickup_id') pickup_id: string) {
        await this.pickupservice.deletePickup(
            pickup_id,
            req.user,
        );
        return { message: 'Pickup deleted successfully', data: true };
    }

    // Restore Pickup
    @Delete('/restorePickup/:pickup_id')
    @ApiOperation({ summary: 'Restore Pickup' })
    @ApiOkResponse({
        description: 'Pickup restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restorePickup(
        @Request() req,
        @Param('pickup_id') pickup_id: string,
    ) {
        await this.pickupservice.restorePickup(
            pickup_id,
            req.user,
        );
        return { message: 'Pickup restored successfully', data: true };
    }
}

