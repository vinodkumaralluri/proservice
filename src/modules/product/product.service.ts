import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppConstant } from '../../utils/app.constants';
import { AppUtils } from '../../utils/app.utils';
import { Product, ProductDocument } from './schemas/product.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { ProductDto } from './dto/product.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Product
    async queryProduct(filter: any) {
        const product = await this.productModel.findOne(filter).exec();
        return product;
    }

    // Add Product
    async addProduct(productDto: ProductDto, loggedInUser: User) {

        // Check for Product Name
        const productcheck = await this.productModel
            .findOne({ product_name: productDto.product_name, status: 1 })
            .exec();
        if (productcheck) {
            throw new BadRequestException('Product already exists');
        }
        // Create Product Id
        const product_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.PRODUCT,
        );
        const product = new Product();
        product.product_id = product_id;
        product.product_name = productDto.product_name;
        product.product_type = productDto.product_type;
        product.created_at = AppUtils.getIsoUtcMoment();
        product.updated_at = AppUtils.getIsoUtcMoment();
        product.created_by = loggedInUser.user_id;
        product.updated_by = loggedInUser.user_id;
        try {
            await this.productModel.create(product);
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.PRODUCT);
            return { status: false, data: e };
        }
    }

    // GET All Products list
    async getProducts(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            params.product_name = { $regex: search };
        }
        const count = await this.productModel.count(params).exec();
        const list = await this.productModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Product by Id
    async getProductById(id: string, loggedInUser: User) {
        const product = await this.productModel
            .findOne({ product_id: id })
            .exec();
        return product;
    }

    // Update Product by Id
    async updateProduct(
        product_id: string,
        productDto: ProductDto,
        loggedInUser: User,
    ) {
        const product = await this.productModel.findOne({ product_id }).exec();
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        product.product_name = productDto.product_name;
        product.product_type = productDto.product_type;
        product.updated_at = AppUtils.getIsoUtcMoment();
        product.updated_by = loggedInUser.user_id;
        return this.productModel.updateOne({ product_id }, product);
    }

    // Delete Product by Id
    async deleteProduct(product_id: string, loggedInUser: User) {
        const product = await this.productModel.findOne({ product_id }).exec();
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        await this.productModel.updateOne({ product_id }, { status: 0 });
        return;
    }

    // Restore Product by Id
    async restoreProduct(product_id: string, loggedInUser: User) {
        const product = await this.productModel.findOne({ product_id }).exec();
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        await this.productModel.updateOne({ product_id }, { status: 1 });
        return;
    }

}





