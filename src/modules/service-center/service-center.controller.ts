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
import { ServiceCenterDto } from './dto/service-center.dto';
import { ServiceCenterService } from './service-center.service';

@Controller({
    path: 'servicecenter',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Servicecenter')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class ServiceCenterController {
    constructor(private readonly servicecenterservice: ServiceCenterService) { }

    // Add Service Center
    @Post('/addServiceCenter')
    @ApiOperation({ summary: 'Add Service Center' })
    @ApiOkResponse({
        description: 'Service Center added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addServiceCenter(@Body() servicecenterDto: ServiceCenterDto, @Request() req) {
        const servicecenter = await this.servicecenterservice.addServiceCenter(
            servicecenterDto,
            req.user,
        );
        if (servicecenter.status == true) {
            return { message: 'Service Center added successfully' };
        } else {
            throw new NotImplementedException(servicecenter.data);
        }
    }

    // Update Service Center
    @Put('/editServiceCenter/:servicecenter_id')
    @ApiOperation({ summary: 'Update Service Center' })
    @ApiOkResponse({
        description: 'Service Center updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateServiceCenter(
        @Request() req,
        @Param('servicecenter_id') servicecenter_id: string,
        @Body() servicecenterDto: ServiceCenterDto,
    ) {
        await this.servicecenterservice.updateServiceCenter(
            servicecenter_id,
            servicecenterDto,
            req.user,
        );
        return { message: 'Service Center updated successfully', data: true };
    }

    // GET All Service Centers list
    @Get('/getServiceCenters/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Service Centers' })
    @ApiOkResponse({
        description: 'Service Centers fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getServiceCenters(
        @Request() req,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const servicecenters = await this.servicecenterservice.getServiceCenters(
            req.user,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Service Centers fetched successfully', data: servicecenters };
    }

    // GET Service Center by Id
    @Get('/getServiceCenterById/:servicecenter_id')
    @ApiOperation({ summary: 'Get Service Center By Id' })
    @ApiOkResponse({
        description: 'Service Center fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getServiceCenterById(
        @Request() req,
        @Param('servicecenter_id') servicecenter_id: string,
    ) {
        const servicecenter = await this.servicecenterservice.getServiceCenterById(
            servicecenter_id,
            req.user,
        );
        return { message: 'Service Center fetched successfully', data: servicecenter };
    }

    // Add Location of the Service Center
    @Put('/addLocationToServiceCenter/:location_id/:servicecenter_id')
    @ApiOperation({ summary: 'Add Location of the Service Center' })
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
    async addLocationToServiceCenter(
        @Request() req,
        @Param('location_id') location_id: string,
        @Param('servicecenter_id') servicecenter_id: string,
    ) {
        await this.servicecenterservice.addLocationToServiceCenter(
            location_id,
            servicecenter_id,
        );
        return { message: 'Location added successfully', data: true };
    }

    // Delete Service Center
    @Delete('/deleteServiceCenter/:servicecenter_id')
    @ApiOperation({ summary: 'Delete Service Center' })
    @ApiOkResponse({
        description: 'Service Center deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteServiceCenter(@Request() req, @Param('servicecenter_id') servicecenter_id: string) {
        await this.servicecenterservice.deleteServiceCenter(
            servicecenter_id,
            req.user,
        );
        return { message: 'Service Center deleted successfully', data: true };
    }

    // Restore Service Center
    @Delete('/restoreServiceCenter/:servicecenter_id')
    @ApiOperation({ summary: 'Restore Service Center' })
    @ApiOkResponse({
        description: 'Service Center restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreServiceCenter(
        @Request() req,
        @Param('servicecenter_id') servicecenter_id: string,
    ) {
        await this.servicecenterservice.restoreServiceCenter(
            servicecenter_id,
            req.user,
        );
        return { message: 'Service Center restored successfully', data: true };
    }
}








