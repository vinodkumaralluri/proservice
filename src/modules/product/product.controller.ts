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
import { ProductDto } from './dto/product.dto';
import { ProductService } from './product.service';

@Controller({
    path: 'product',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Product')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class ProductController {
    constructor(private readonly productservice: ProductService) { }

    // Add Product
    @Post('/addProduct')
    @ApiOperation({ summary: 'Add Product' })
    @ApiOkResponse({
        description: 'Product added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addProduct(@Body() productDto: ProductDto, @Request() req) {
        const product = await this.productservice.addProduct(
            productDto,
            req.user,
        );
        if (product.status == true) {
            return { message: 'Product added successfully' };
        } else {
            throw new NotImplementedException(product.data);
        }
    }

    // Update Product
    @Put('/:product_id')
    @ApiOperation({ summary: 'Update Product' })
    @ApiOkResponse({
        description: 'Product updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateProduct(
        @Request() req,
        @Param('product_id') product_id: string,
        @Body() productDto: ProductDto,
    ) {
        await this.productservice.updateProduct(
            product_id,
            productDto,
            req.user,
        );
        return { message: 'Product updated successfully', data: true };
    }

    // GET All Products list
    @Get('/getProducts')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Products' })
    @ApiOkResponse({
        description: 'Products fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getProducts(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const products = await this.productservice.getProducts(
            req.user,
            page,
            limit,
            search,
        );
        return { message: 'Products fetched successfully', data: products };
    }

    // GET Product by Id
    @Get('/getProductById/:product_id')
    @ApiOperation({ summary: 'Get Product By Id' })
    @ApiOkResponse({
        description: 'Product fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getProductById(
        @Request() req,
        @Param('product_id') product_id: string,
    ) {
        const product = await this.productservice.getProductById(
            product_id,
            req.user,
        );
        return { message: 'Product fetched successfully', data: product };
    }

    // Delete Product
    @Delete('/:product_id')
    @ApiOperation({ summary: 'Delete Product' })
    @ApiOkResponse({
        description: 'Product deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteProduct(@Request() req, @Param('product_id') product_id: string) {
        await this.productservice.deleteProduct(
            product_id,
            req.user,
        );
        return { message: 'Product deleted successfully', data: true };
    }

    // Restore Product
    @Delete('/restore_product/:product_id')
    @ApiOperation({ summary: 'Restore Product' })
    @ApiOkResponse({
        description: 'Product restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreProduct(
        @Request() req,
        @Param('product_id') product_id: string,
    ) {
        await this.productservice.restoreProduct(
            product_id,
            req.user,
        );
        return { message: 'Product restored successfully', data: true };
    }
}







