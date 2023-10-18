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
import { VehicleService } from './vehicle.service';

@Controller({
    path: 'vehicle',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Transport')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class VehicleController {
    constructor(private readonly vehicleservice: VehicleService) { }

    // Add Vehicle
    @Post('/addVehilce')
    @ApiOperation({ summary: 'Add Vehicle' })
    @ApiOkResponse({
        description: 'Vehicle added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addVehicle(@Body() vehicleDto: VehicleDto, @Request() req) {
        const vehicle = await this.vehicleservice.addVehicle(
            vehicleDto,
            req.user,
        );
        if (vehicle.status == true) {
            return { message: 'Vehicle added successfully' };
        } else {
            throw new NotImplementedException(vehicle.data);
        }
    }

    // Update Vehicle
    @Put('/:vehicle_id')
    @ApiOperation({ summary: 'Update Vehicle' })
    @ApiOkResponse({
        description: 'Vehicle updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateVehicle(
        @Request() req,
        @Param('vehicle_id') vehicle_id: string,
        @Body() vehicleDto: VehicleDto,
    ) {
        await this.vehicleservice.updateVehicle(
            vehicle_id,
            vehicleDto,
            req.user,
        );
        return { message: 'Vehicle updated successfully', data: true };
    }

    // GET All Vehicles list
    @Get('/getVehicles/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Vehicles' })
    @ApiOkResponse({
        description: 'Vehicles fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getVehicles(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const vehicles = await this.vehicleservice.getVehicles(
            req.user,
            page,
            limit,
            search,
        );
        return { message: 'Vehicles fetched successfully', data: vehicles };
    }

    // GET Vehicle by Id
    @Get('/getVehicleById/:vehicle_id')
    @ApiOperation({ summary: 'Get Vehicle By Id' })
    @ApiOkResponse({
        description: 'Vehicle fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getVehicleById(
        @Request() req,
        @Param('vehicle_id') vehicle_id: string,
    ) {
        const vehicle = await this.vehicleservice.getVehicleById(
            vehicle_id,
            req.user,
        );
        return { message: 'Vehicle fetched successfully', data: vehicle };
    }

    // Delete Vehicle
    @Delete('/deleteVehicle/:vehicle_id')
    @ApiOperation({ summary: 'Delete Vehicle' })
    @ApiOkResponse({
        description: 'Vehicle deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteVehicle(@Request() req, @Param('vehicle_id') vehicle_id: string) {
        await this.vehicleservice.deleteVehicle(
            vehicle_id,
            req.user,
        );
        return { message: 'Vehicle deleted successfully', data: true };
    }

    // Restore Vehicle
    @Delete('/restoreVehicle/:vehicle_id')
    @ApiOperation({ summary: 'Restore Vehicle' })
    @ApiOkResponse({
        description: 'Vehicle restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreVehicle(
        @Request() req,
        @Param('vehicle_id') vehicle_id: string,
    ) {
        await this.vehicleservice.restoreVehicle(
            vehicle_id,
            req.user,
        );
        return { message: 'Vehicle restored successfully', data: true };
    }
}

