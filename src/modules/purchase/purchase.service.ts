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
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { Item, ItemDocument } from '../item/schemas/item.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { PurchaseDto } from './dto/purchase.dto';
import { User } from '../users/schemas/user.schema';
import { ItemStatus } from 'src/enums/item-status.enum';

@Injectable()
export class PurchaseService {
    constructor(
        @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
        @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Purchase
    async queryPurchase(filter: any) {
        const purchase = await this.purchaseModel.findOne(filter).exec();
        return purchase;
    }

    // Add Purchase
    async addPurchase(purchaseDto: PurchaseDto, loggedInUser: User) {

        // Check for Purchase
        const purchasecheck = await this.purchaseModel
            .findOne({ item_id: purchaseDto.item_id, status: 1 })
            .exec();
        if (purchasecheck) {
            throw new BadRequestException('Purchase of the Product is already done');
        }
        // Create Purchase Id
        const purchase_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.PURCHASE,
        );
        const purchase = new Purchase();
        purchase.purchase_id = purchase_id;
        purchase.item_id = purchaseDto.item_id;
        purchase.customer_id = purchaseDto.customer_id;
        purchase.invoice_number = purchaseDto.invoice_number;
        purchase.purchase_date = purchaseDto.purchase_date;
        purchase.purchase_price = purchaseDto.purchase_price;
        purchase.warranty_id = purchaseDto.warranty_id;
        purchase.discount_code = purchaseDto.discount_code;
        purchase.created_at = AppUtils.getIsoUtcMoment();
        purchase.updated_at = AppUtils.getIsoUtcMoment();
        purchase.created_by = loggedInUser.user_id;
        purchase.updated_by = loggedInUser.user_id;
        if (purchaseDto.warranty_id) {
            purchase.warranty = true;
        } else {
            purchase.warranty = false;
        }
        try {
            await this.purchaseModel.create(purchase);
            await this.itemModel.updateOne({item_id: purchase.item_id}, {item_status: ItemStatus.Sold});
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.PURCHASE);
            return { status: false, data: e };
        }
    }

    // GET All Purchases list by Model
    async getPurchasesByModelId(
        loggedInUser: User,
        model_id: string,
        company_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            params.customer_id = { $regex: search };
        }
        const count = await this.purchaseModel.count(params).exec();
        const list = await this.purchaseModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET All Purchases list by Product
    async getPurchasesByProductId(
        loggedInUser: User,
        product_id: string,
        company_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { product_id: product_id, status: 1 };
        if (search) {
            params.customer_id = { $regex: search };
        }
        const count = await this.purchaseModel.count(params).exec();
        // const list = await this.purchaseModel
        //     .aggregate([
        //         {
        //             $match: params,
        //         },
        //         {
        //             $limit: limit,
        //         },
        //         {
        //             $lookup: {
        //                 from: 'users',
        //                 localField: 'user_id',
        //                 foreignField: 'user_id',
        //                 as: 'users_doc',
        //             },
        //         },
        //         { $unwind: '$users_doc' },
        //         {
        //             $project: {
        //                 transaction_id: '$transaction_id',
        //                 source: '$source',
        //                 destination: '$destination',
        //                 order_id: '$order_id',
        //                 amount: '$amount',
        //                 transaction_type: '$transaction_type',
        //                 commission: '$commission',
        //                 timestamp: '$timestamp',
        //             },
        //         },
        //     ])
        const list = await this.purchaseModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET All Purchases list by Company
    async getPurchasesByCompanyId(
        loggedInUser: User,
        company_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { company_id: company_id, status: 1 };
        if (search) {
            params.customer_id = { $regex: search };
        }
        const count = await this.purchaseModel.count(params).exec();
        const list = await this.purchaseModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET All Purchases list by Store
    async getPurchasesByStoreId(
        loggedInUser: User,
        store_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { store_id: store_id, status: 1 };
        if (search) {
            params.customer_id = { $regex: search };
        }
        const count = await this.purchaseModel.count(params).exec();
        const list = await this.purchaseModel.aggregate([
            { $match: params },
            { $limit: limit },
            {
                $lookup: {
                    from: 'items',
                    localField: 'item_id',
                    foreignField: 'item_id',
                    as: 'items_doc',
                },
            },
            { $unwind: '$items_doc' },
            {
                $lookup: {
                    from: 'models',
                    localField: 'items_doc.model_id',
                    foreignField: 'model_id',
                    as: 'models_doc',
                },
            },
            { $unwind: '$models_doc' },
            {
                $project: {
                    purchase_id: '$purchase_id',
                    item_id: '$item_id',
                    model_id: '$models_doc.model_id',
                    product_id: '$models_doc.product_id',
                    company_id: '$models_doc.company_id',
                    customer_id: '$customer_id',
                    invoice_number: '$invoice_number',
                    purchase_date: '$purchase_date',
                    warranty: '$warranty',
                    warranty_id: '$warranty_id',
                    purchase_price: '$purchase_price',
                    discount_code: '$discount_code',
                    created_at: '$created_at',
                    created_by: '$created_by',
                    updated_at: '$updated_at',
                    updated_by: '$updated_by',
                    status: '$status',
                },
            },
        ]).skip((page - 1) * limit).exec();
        return { list, count };
    }

    // GET Purchase by Id
    async getPurchaseById(id: string, loggedInUser: User) {
        const purchase = await this.purchaseModel
            .findOne({ purchase_id: id })
            .exec();
        return purchase;
    }

    // GET Purchase by Invoice number
    async getPurchaseByInvoice(invoice: string, loggedInUser: User) {
        const purchase = await this.purchaseModel.aggregate([
            { $match: { invoice_number: invoice, status: 1 } },
            {
                $lookup: {
                    from: 'items',
                    localField: 'item_id',
                    foreignField: 'item_id',
                    as: 'items_doc',
                },
            },
            { $unwind: '$items_doc' },
            {
                $lookup: {
                    from: 'models',
                    localField: 'items_doc.model_id',
                    foreignField: 'model_id',
                    as: 'models_doc',
                },
            },
            { $unwind: '$models_doc' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'models_doc.product_id',
                    foreignField: 'product_id',
                    as: 'products_doc',
                },
            },
            { $unwind: '$products_doc' },
            {
                $project: {
                    item_id: '$item_id',
                    serial_number: '$items_doc.serial_number',
                    model_id: '$models_doc.model_id',
                    model_number: '$models_doc.model_number',
                    product_id: '$products_doc.product_id',
                    product_name: '$products_doc.product_name',
                    purchase_date: '$purchase_date',
                },
            },
        ])
        return purchase;
    }

    // Update Purchase by Id
    async updatePurchase(
        purchase_id: string,
        purchaseDto: PurchaseDto,
        loggedInUser: User,
    ) {
        const purchase = await this.purchaseModel.findOne({ purchase_id }).exec();
        if (!purchase) {
            throw new NotFoundException('Purchase not found');
        }
        purchase.invoice_number = purchaseDto.invoice_number;
        purchase.purchase_date = purchaseDto.purchase_date;
        purchase.purchase_price = purchaseDto.purchase_price;
        purchase.warranty_id = purchaseDto.warranty_id;
        purchase.discount_code = purchaseDto.discount_code;
        purchase.updated_at = AppUtils.getIsoUtcMoment();
        purchase.updated_by = loggedInUser.user_id;
        if (purchaseDto.warranty_id) {
            purchase.warranty = true;
        } else {
            purchase.warranty = false;
        }
        return this.purchaseModel.updateOne({ purchase_id }, purchase);
    }

    // Delete Purchase by Id
    async deletePurchase(purchase_id: string, loggedInUser: User) {
        const purchase = await this.purchaseModel.findOne({ purchase_id }).exec();
        if (!purchase) {
            throw new NotFoundException('Purchase not found');
        }
        await this.purchaseModel.updateOne({ purchase_id }, { status: 0 });
        return;
    }

    // Restore Purchase by Id
    async restorePurchase(purchase_id: string, loggedInUser: User) {
        const purchase = await this.purchaseModel.findOne({ purchase_id }).exec();
        if (!purchase) {
            throw new NotFoundException('Purchase not found');
        }
        await this.purchaseModel.updateOne({ purchase_id }, { status: 1 });
        return;
    }

}

