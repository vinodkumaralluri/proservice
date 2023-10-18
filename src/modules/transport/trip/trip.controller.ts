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
import { VehicleDto } from '../dto/vehicle.dto';
import { LocationDto } from '../../location/dto/location.dto';
import { TripDto } from '../dto/trip.dto';
import { TripService } from './trip.service';

@Controller({
    path: 'trip',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Trip')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class TripController {
    constructor(private readonly tripservice: TripService) { }

    // Add Trip
    @Post('/addTrip')
    @ApiOperation({ summary: 'Add Trip' })
    @ApiOkResponse({
        description: 'Trip added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addTrip(@Body() tripDto: TripDto, @Request() req) {
        const trip = await this.tripservice.addTrip(
            tripDto,
            req.user,
        );
        if (trip.status == true) {
            return { message: 'Trip added successfully' };
        } else {
            throw new NotImplementedException(trip.data);
        }
    }

    // Update Trip
    @Put('/editTrip/:trip_id')
    @ApiOperation({ summary: 'Update Trip' })
    @ApiOkResponse({
        description: 'Trip updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateTrip(
        @Request() req,
        @Param('trip_id') trip_id: string,
        @Body() tripDto: TripDto,
    ) {
        await this.tripservice.updateTrip(
            trip_id,
            tripDto,
            req.user,
        );
        return { message: 'Trip updated successfully', data: true };
    }

    // GET All Trips list
    @Get('/getTrips/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Trips' })
    @ApiOkResponse({
        description: 'Trips fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getTrips(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const trips = await this.tripservice.getTrips(
            req.user,
            page,
            limit,
            search,
        );
        return { message: 'Trips fetched successfully', data: trips };
    }

    // GET Trip by Id
    @Get('/getTripById/:trip_id')
    @ApiOperation({ summary: 'Get Trip By Id' })
    @ApiOkResponse({
        description: 'Trip fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getTripById(
        @Request() req,
        @Param('trip_id') trip_id: string,
    ) {
        const trip = await this.tripservice.getTripById(
            trip_id,
            req.user,
        );
        return { message: 'Trip fetched successfully', data: trip };
    }

    // Update Live Location
    @Put('/updateLiveLocation/:trip_id')
    @ApiOperation({ summary: 'Update Trip Live Location' })
    @ApiOkResponse({
        description: 'Trip Live Location updated successfully',
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
        @Param('trip_id') trip_id: string,
        @Body() locationDto: LocationDto,
    ) {
        await this.tripservice.updateLiveLocation(
            trip_id,
            locationDto,
            req.user,
        );
        return { message: 'Trip Live Location updated successfully', data: true };
    }

    // Add Item to Trip
    @Put('/addItemToTrip/:item_id/:trip_id')
    @ApiOperation({ summary: 'Add Item to Trip' })
    @ApiOkResponse({
        description: 'Item added to Trip successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addItemToTrip(
        @Request() req,
        @Param('item_id') item_id: string,
        @Param('trip_id') trip_id: string,
    ) {
        await this.tripservice.addItemToTrip(
            item_id,
            trip_id,
            req.user,
        );
        return { message: 'Item added to Trip successfully', data: true };
    }

    // Delete Trip
    @Delete('/deleteTrip/:trip_id')
    @ApiOperation({ summary: 'Delete Trip' })
    @ApiOkResponse({
        description: 'Trip deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteTrip(@Request() req, @Param('trip_id') trip_id: string) {
        await this.tripservice.deleteTrip(
            trip_id,
            req.user,
        );
        return { message: 'Trip deleted successfully', data: true };
    }

    // Restore Trip
    @Delete('/restoreTrip/:trip_id')
    @ApiOperation({ summary: 'Restore Trip' })
    @ApiOkResponse({
        description: 'Trip restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreTrip(
        @Request() req,
        @Param('trip_id') trip_id: string,
    ) {
        await this.tripservice.restoreTrip(
            trip_id,
            req.user,
        );
        return { message: 'Trip restored successfully', data: true };
    }
}


