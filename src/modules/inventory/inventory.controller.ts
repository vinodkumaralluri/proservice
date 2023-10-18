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
import { InventoryDto } from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@Controller({
    path: 'inventory',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Inventory')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class InventoryController {
    constructor(private readonly inventoryservice: InventoryService) { }

    // Add Inventory
    @Post('/addInventory')
    @ApiOperation({ summary: 'Add Inventory' })
    @ApiOkResponse({
        description: 'Inventory added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addInventory(@Body() inventoryDto: InventoryDto, @Request() req) {
        const inventory = await this.inventoryservice.addInventory(
            inventoryDto,
            req.user,
        );
        if (inventory.status == true) {
            return { message: 'Inventory added successfully' };
        } else {
            throw new NotImplementedException(inventory.data);
        }
    }

    // Update Inventory
    @Put('/editInventory/:inventory_id')
    @ApiOperation({ summary: 'Update Inventory' })
    @ApiOkResponse({
        description: 'Inventory updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateInventory(
        @Request() req,
        @Param('inventory_id') inventory_id: string,
        @Body() inventoryDto: InventoryDto,
    ) {
        await this.inventoryservice.updateInventory(
            inventory_id,
            inventoryDto,
            req.user,
        );
        return { message: 'Inventory updated successfully', data: true };
    }

    // GET All Inventories list
    @Get('/getInventories')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Inventories' })
    @ApiOkResponse({
        description: 'Inventories fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getInventories(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const inventories = await this.inventoryservice.getInventories(
            req.user,
            page,
            limit,
            search,
        );
        return { message: 'Inventories fetched successfully', data: inventories };
    }

    // GET Inventory by Id
    @Get('/getInventoryById/:inventory_id')
    @ApiOperation({ summary: 'Get Inventory By Id' })
    @ApiOkResponse({
        description: 'Inventory fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getInventoryById(
        @Request() req,
        @Param('inventory_id') inventory_id: string,
    ) {
        const inventory = await this.inventoryservice.getInventoryById(
            req.user,
            inventory_id,
        );
        return { message: 'Inventory fetched successfully', data: inventory };
    }

    // GET Inventory by Store Id
    @Get('/getInventoryByStoreId/:store_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Inventory By Store Id' })
    @ApiOkResponse({
        description: 'Inventory fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getInventoryByStoreId(
        @Request() req,
        @Param('store_id') store_id: string,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const inventory = await this.inventoryservice.getInventoryByStoreId(
            req.user,
            store_id,
            page,
            limit,
            search,
        );
        return { message: 'Inventory fetched successfully', data: inventory };
    }

    // GET Inventory by Model Id
    @Get('/getInventoryByModelId/:model_id/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Inventory By Model Id' })
    @ApiOkResponse({
        description: 'Inventory fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getInventoryByModelId(
        @Request() req,
        @Param('model_id') model_id: string,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const inventory = await this.inventoryservice.getInventoryByModelId(
            req.user,
            model_id,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Inventory fetched successfully', data: inventory };
    }

    // GET Inventory by Product Id
    @Get('/getInventoryByProductId/:product_id/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Inventory By Product Id' })
    @ApiOkResponse({
        description: 'Inventory fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getInventoryByProductId(
        @Request() req,
        @Param('product_id') product_id: string,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const inventory = await this.inventoryservice.getInventoryByProductId(
            req.user,
            product_id,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Inventory fetched successfully', data: inventory };
    }

    // Delete Inventory
    @Delete('/deleteInventory/:inventory_id')
    @ApiOperation({ summary: 'Delete Inventory' })
    @ApiOkResponse({
        description: 'Inventory deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteInventory(@Request() req, @Param('inventory_id') inventory_id: string) {
        await this.inventoryservice.deleteInventory(
            inventory_id,
            req.user,
        );
        return { message: 'Inventory deleted successfully', data: true };
    }

    // Restore Inventory
    @Delete('/restoreInventory/:inventory_id')
    @ApiOperation({ summary: 'Restore Inventory' })
    @ApiOkResponse({
        description: 'Inventory restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreInventory(
        @Request() req,
        @Param('inventory_id') inventory_id: string,
    ) {
        await this.inventoryservice.restoreInventory(
            inventory_id,
            req.user,
        );
        return { message: 'Inventory restored successfully', data: true };
    }
}

