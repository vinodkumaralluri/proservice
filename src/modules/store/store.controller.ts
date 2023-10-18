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
import { StoreDto } from './dto/store.dto';
import { StoreService } from './store.service';

@Controller({
    path: 'store',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Store')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class StoreController {
    constructor(private readonly storeservice: StoreService) { }

    // Add Store
    @Post('/addStore')
    @ApiOperation({ summary: 'Add Store' })
    @ApiOkResponse({
        description: 'Store added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addStore(@Body() storeDto: StoreDto, @Request() req) {
        const store = await this.storeservice.addStore(
            storeDto,
            req.user,
        );
        if (store.status == true) {
            return { message: 'Store added successfully' };
        } else {
            throw new NotImplementedException(store.data);
        }
    }

    // Update Store
    @Put('/editStore/:store_id')
    @ApiOperation({ summary: 'Update Store' })
    @ApiOkResponse({
        description: 'Store updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateStore(
        @Request() req,
        @Param('store_id') store_id: string,
        @Body() storeDto: StoreDto,
    ) {
        await this.storeservice.updateStore(
            store_id,
            storeDto,
            req.user,
        );
        return { message: 'Store updated successfully', data: true };
    }

    // GET All Stores list
    @Get('/getStores/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Stores' })
    @ApiOkResponse({
        description: 'Stores fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getStores(
        @Request() req,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const stores = await this.storeservice.getStores(
            req.user,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Stores fetched successfully', data: stores };
    }

    // GET Store by Id
    @Get('/getStoreById/:store_id')
    @ApiOperation({ summary: 'Get Store By Id' })
    @ApiOkResponse({
        description: 'Store fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getStoreById(
        @Request() req,
        @Param('store_id') store_id: string,
    ) {
        const store = await this.storeservice.getStoreById(
            store_id,
            req.user,
        );
        return { message: 'Store fetched successfully', data: store };
    }

    // Delete Store
    @Delete('/deleteStore/:store_id')
    @ApiOperation({ summary: 'Delete Store' })
    @ApiOkResponse({
        description: 'Store deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteStore(@Request() req, @Param('store_id') store_id: string) {
        await this.storeservice.deleteStore(
            store_id,
            req.user,
        );
        return { message: 'Store deleted successfully', data: true };
    }

    // Restore Store
    @Delete('/restoreStore/:store_id')
    @ApiOperation({ summary: 'Restore Store' })
    @ApiOkResponse({
        description: 'Store restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreStore(
        @Request() req,
        @Param('store_id') store_id: string,
    ) {
        await this.storeservice.restoreStore(
            store_id,
            req.user,
        );
        return { message: 'Store restored successfully', data: true };
    }
}









