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
import { ItemDto } from './dto/item.dto';
import { ItemService } from './item.service';

@Controller({
    path: 'item',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Item')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class ItemController {
    constructor(private readonly itemservice: ItemService) { }

    // Add Item
    @Post('/addItem')
    @ApiOperation({ summary: 'Add Item' })
    @ApiOkResponse({
        description: 'Item added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addItem(@Body() itemDto: ItemDto, @Request() req) {
        const item = await this.itemservice.addItem(
            itemDto,
            req.user,
        );
        if (item.status == true) {
            return { message: 'Item added successfully' };
        } else {
            throw new NotImplementedException(item.data);
        }
    }

    // Update Item
    @Put('/editItem/:item_id')
    @ApiOperation({ summary: 'Update Item' })
    @ApiOkResponse({
        description: 'Item updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateItem(
        @Request() req,
        @Param('item_id') item_id: string,
        @Body() itemDto: ItemDto,
    ) {
        await this.itemservice.updateItem(
            item_id,
            itemDto,
            req.user,
        );
        return { message: 'Item updated successfully', data: true };
    }

    // GET All Items list
    @Get('/getItems/:model_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Items' })
    @ApiOkResponse({
        description: 'Items fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getItems(
        @Request() req,
        @Param('model_id') model_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const items = await this.itemservice.getItems(
            req.user,
            model_id,
            page,
            limit,
            search,
        );
        return { message: 'Items fetched successfully', data: items };
    }

    // GET Item by Id
    @Get('/getItemById/:item_id')
    @ApiOperation({ summary: 'Get Item By Id' })
    @ApiOkResponse({
        description: 'Item fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getItemById(
        @Request() req,
        @Param('item_id') item_id: string,
    ) {
        const item = await this.itemservice.getItemById(
            item_id,
            req.user,
        );
        return { message: 'Item fetched successfully', data: item };
    }

    // Delete Item
    @Delete('/deleteItem/:item_id')
    @ApiOperation({ summary: 'Delete Item' })
    @ApiOkResponse({
        description: 'Item deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteItem(@Request() req, @Param('item_id') item_id: string) {
        await this.itemservice.deleteItem(
            item_id,
            req.user,
        );
        return { message: 'Item deleted successfully', data: true };
    }

    // Restore Item
    @Delete('/restoreItem/:item_id')
    @ApiOperation({ summary: 'Restore Item' })
    @ApiOkResponse({
        description: 'Item restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreItem(
        @Request() req,
        @Param('item_id') item_id: string,
    ) {
        await this.itemservice.restoreItem(
            item_id,
            req.user,
        );
        return { message: 'Item restored successfully', data: true };
    }

    // Verify Item
    @Get('/verifyItem/:serial_number')
    @ApiOperation({ summary: 'Verify Item' })
    @ApiOkResponse({
        description: 'Item verified successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async verifyItem(
        @Request() req,
        @Param('serial_number') serial_number: string,
    ) {
        const item = await this.itemservice.verifyItem(
            serial_number,
        );
        if(item.status == true) {
            return { message: 'Item verified successfully', data: true };
        } else {
            return { message: 'Item is not Verified', data: false };            
        }
    }
}
