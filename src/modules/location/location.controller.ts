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
import { LocationDto } from './dto/location.dto';
import { LocationService } from './location.service';

@Controller({
    path: 'location',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Location')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class LocationController {
    constructor(private readonly locationservice: LocationService) { }

    // Add Location
    @Post('/addLocation')
    @ApiOperation({ summary: 'Add Location' })
    @ApiOkResponse({
        description: 'Location added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addLocation(@Body() locationDto: LocationDto, @Request() req) {
        const location = await this.locationservice.addLocation(
            locationDto,
            req.user.user_id,
        );
        if (location.status == true) {
            return { message: 'Location added successfully' };
        } else {
            throw new NotImplementedException(location.data);
        }
    }

    // Update Location
    @Put('/editLocation/:location_id')
    @ApiOperation({ summary: 'Update Location' })
    @ApiOkResponse({
        description: 'Location updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateLocation(
        @Request() req,
        @Param('location_id') location_id: string,
        @Body() locationDto: LocationDto,
    ) {
        await this.locationservice.updateLocation(
            location_id,
            locationDto,
            req.user,
        );
        return { message: 'Location updated successfully', data: true };
    }

    // GET All Locations list
    @Get('/getLocations/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Locations' })
    @ApiOkResponse({
        description: 'Locations fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getLocations(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const locations = await this.locationservice.getLocations(
            req.user,
            page,
            limit,
            search,
        );
        return { message: 'Locations fetched successfully', data: locations };
    }

    // GET Location by Id
    @Get('/getLocationById/:location_id')
    @ApiOperation({ summary: 'Get Location By Id' })
    @ApiOkResponse({
        description: 'Location fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getLocationById(
        @Request() req,
        @Param('location_id') location_id: string,
    ) {
        const location = await this.locationservice.getLocationById(
            location_id,
            req.user,
        );
        return { message: 'Location fetched successfully', data: location };
    }

    // Delete Location
    @Delete('/deleteLocation/:location_id')
    @ApiOperation({ summary: 'Delete Location' })
    @ApiOkResponse({
        description: 'Location deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteLocation(@Request() req, @Param('location_id') location_id: string) {
        await this.locationservice.deleteLocation(
            location_id,
            req.user,
        );
        return { message: 'Location deleted successfully', data: true };
    }

    // Restore Location
    @Delete('/restoreLocation/:location_id')
    @ApiOperation({ summary: 'Restore Location' })
    @ApiOkResponse({
        description: 'Location restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreLocation(
        @Request() req,
        @Param('location_id') location_id: string,
    ) {
        await this.locationservice.restoreLocation(
            location_id,
            req.user,
        );
        return { message: 'Location restored successfully', data: true };
    }
}


