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
import { WarehouseDto } from './dto/warehouse.dto';
import { WarehouseService } from './warehouse.service';

@Controller({
    path: 'warehouse',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Warehouse')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class WarehouseController {
    constructor(private readonly warehouseservice: WarehouseService) { }

    // Add Warehouse
    @Post('/addWarehouse')
    @ApiOperation({ summary: 'Add Warehouse' })
    @ApiOkResponse({
        description: 'Warehouse added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addWarehouse(@Body() warehouseDto: WarehouseDto, @Request() req) {
        const warehouse = await this.warehouseservice.addWarehouse(
            warehouseDto,
            req.user,
        );
        if (warehouse.status == true) {
            return { message: 'Warehouse added successfully' };
        } else {
            throw new NotImplementedException(warehouse.data);
        }
    }

    // Update Warehouse
    @Put('/editWarehouse/:warehouse_id')
    @ApiOperation({ summary: 'Update Warehouse' })
    @ApiOkResponse({
        description: 'Warehouse updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateWarehouse(
        @Request() req,
        @Param('warehouse_id') warehouse_id: string,
        @Body() warehouseDto: WarehouseDto,
    ) {
        await this.warehouseservice.updateWarehouse(
            warehouse_id,
            warehouseDto,
            req.user,
        );
        return { message: 'Warehouse updated successfully', data: true };
    }

    // GET All Warehouses list
    @Get('/getWarehouses/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Warehouses' })
    @ApiOkResponse({
        description: 'Warehouses fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getWarehouses(
        @Request() req,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const warehouses = await this.warehouseservice.getWarehouses(
            req.user,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Warehouses fetched successfully', data: warehouses };
    }

    // GET Warehouse by Id
    @Get('/getWarehouseById/:warehouse_id')
    @ApiOperation({ summary: 'Get Warehouse By Id' })
    @ApiOkResponse({
        description: 'Warehouse fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getWarehouseById(
        @Request() req,
        @Param('warehouse_id') warehouse_id: string,
    ) {
        const warehouse = await this.warehouseservice.getWarehouseById(
            warehouse_id,
            req.user,
        );
        return { message: 'Warehouse fetched successfully', data: warehouse };
    }

    // Delete Warehouse
    @Delete('/deleteWarehouse/:warehouse_id')
    @ApiOperation({ summary: 'Delete Warehouse' })
    @ApiOkResponse({
        description: 'Warehouse deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteWarehouse(@Request() req, @Param('warehouse_id') warehouse_id: string) {
        await this.warehouseservice.deleteWarehouse(
            warehouse_id,
            req.user,
        );
        return { message: 'Warehouse deleted successfully', data: true };
    }

    // Restore Warehouse
    @Delete('/restoreWarehouse/:warehouse_id')
    @ApiOperation({ summary: 'Restore Warehouse' })
    @ApiOkResponse({
        description: 'Warehouse restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreWarehouse(
        @Request() req,
        @Param('warehouse_id') warehouse_id: string,
    ) {
        await this.warehouseservice.restoreWarehouse(
            warehouse_id,
            req.user,
        );
        return { message: 'Warehouse restored successfully', data: true };
    }
}
