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
import { PurchaseDto } from './dto/purchase.dto';
import { PurchaseService } from './purchase.service';

@Controller({
    path: 'purchase',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Purchase')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class PurchaseController {
    constructor(private readonly purchaseservice: PurchaseService) { }

    // Add Purchase
    @Post('/addPurchase')
    @ApiOperation({ summary: 'Add Purchase' })
    @ApiOkResponse({
        description: 'Purchase added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addPurchase(@Body() purchaseDto: PurchaseDto, @Request() req) {
        const purchase = await this.purchaseservice.addPurchase(
            purchaseDto,
            req.user,
        );
        if (purchase.status == true) {
            return { message: 'Purchase added successfully' };
        } else {
            throw new NotImplementedException(purchase.data);
        }
    }

    // Update Purchase
    @Put('/editPurchase/:purchase_id')
    @ApiOperation({ summary: 'Update Purchase Item' })
    @ApiOkResponse({
        description: 'Purchase Item updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updatePurchase(
        @Request() req,
        @Param('purchase_id') purchase_id: string,
        @Body() purchaseDto: PurchaseDto,
    ) {
        await this.purchaseservice.updatePurchase(
            purchase_id,
            purchaseDto,
            req.user,
        );
        return { message: 'Purchase updated successfully', data: true };
    }

    // GET All Model Purchases list
    @Get('/getPurchasesByModelId/:model_id/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Purchases' })
    @ApiOkResponse({
        description: 'Purchases fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getPurchasesByModelId(
        @Request() req,
        @Param('model_id') model_id: string,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const purchases = await this.purchaseservice.getPurchasesByModelId(
            req.user,
            model_id,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Purchases fetched successfully', data: purchases };
    }

    // GET All Product Purchases list
    @Get('/getPurchasesByProductId/:product_id/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Purchases' })
    @ApiOkResponse({
        description: 'Purchases fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getPurchasesByProductId(
        @Request() req,
        @Param('product_id') product_id: string,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const purchases = await this.purchaseservice.getPurchasesByProductId(
            req.user,
            product_id,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Purchases fetched successfully', data: purchases };
    }

    // GET All Product Purchases list
    @Get('/getPurchasesByProductId/:store_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Purchases' })
    @ApiOkResponse({
        description: 'Purchases fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getPurchasesByStoreId(
        @Request() req,
        @Param('store_id') store_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const purchases = await this.purchaseservice.getPurchasesByStoreId(
            req.user,
            store_id,
            page,
            limit,
            search,
        );
        return { message: 'Purchases fetched successfully', data: purchases };
    }

    // GET All Company Purchases list
    @Get('/getPurchasesByCompanyId/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get All Company Purchases' })
    @ApiOkResponse({
        description: 'All Company Purchases fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getPurchasesByCompanyId(
        @Request() req,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const purchases = await this.purchaseservice.getPurchasesByCompanyId(
            req.user,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Purchases fetched successfully', data: purchases };
    }

    // GET Purchase by Id
    @Get('/getPurchaseById/:purchase_id')
    @ApiOperation({ summary: 'Get Purchase By Id' })
    @ApiOkResponse({
        description: 'Purchase fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getPurchaseById(
        @Request() req,
        @Param('purchase_id') purchase_id: string,
    ) {
        const purchase = await this.purchaseservice.getPurchaseById(
            purchase_id,
            req.user,
        );
        return { message: 'Purchase fetched successfully', data: purchase };
    }

    // GET Purchase by Invoice number
    @Get('/getPurchaseByInvoice/:invoice_number')
    @ApiOperation({ summary: 'Get Purchase By Invoice' })
    @ApiOkResponse({
        description: 'Purchase fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getPurchaseByInvoice(
        @Request() req,
        @Param('invoice_number') invoice_number: string,
    ) {
        const purchase = await this.purchaseservice.getPurchaseByInvoice(
            invoice_number,
            req.user,
        );
        return { message: 'Purchase fetched successfully', data: purchase };
    }

    // Delete Purchase
    @Delete('/deletePurchase/:purchase_id')
    @ApiOperation({ summary: 'Delete Purchase' })
    @ApiOkResponse({
        description: 'Purchase deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deletePurchase(@Request() req, @Param('purchase_id') purchase_id: string) {
        await this.purchaseservice.deletePurchase(
            purchase_id,
            req.user,
        );
        return { message: 'Purchase deleted successfully', data: true };
    }

    // Restore Purchase
    @Delete('/restorePurchase/:purchase_id')
    @ApiOperation({ summary: 'Restore Purchase' })
    @ApiOkResponse({
        description: 'Purchase restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restorePurchase(
        @Request() req,
        @Param('purchase_id') purchase_id: string,
    ) {
        await this.purchaseservice.restorePurchase(
            purchase_id,
            req.user,
        );
        return { message: 'Purchase restored successfully', data: true };
    }
}

