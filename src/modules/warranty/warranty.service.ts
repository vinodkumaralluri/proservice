import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { model, Model } from 'mongoose';
import { AppConstant } from '../../utils/app.constants';
import { AppUtils } from '../../utils/app.utils';
import { Warranty, WarrantyDocument } from './schemas/warranty.schema';
import { Claim, ClaimDocument } from './schemas/claims.schema';
import { Item, ItemDocument } from '../item/schemas/item.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { WarrantyDto } from './dto/warranty.dto';
import { ClaimDto } from './dto/claim.dto';
import { User } from '../users/schemas/user.schema';
import { ClaimStatus } from 'src/enums/claim-status.enum';

@Injectable()
export class WarrantyService {
    constructor(
        @InjectModel(Warranty.name) private warrantyModel: Model<WarrantyDocument>,
        @InjectModel(Claim.name) private claimModel: Model<ClaimDocument>,
        @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Warranty
    async queryWarranty(filter: any) {
        const warranty = await this.warrantyModel.findOne(filter).exec();
        return warranty;
    }

    // Add Warranty
    async addWarranty(warrantyDto: WarrantyDto, loggedInUser: User) {

        // Check for Item Warranty
        const warrantycheck = await this.warrantyModel
            .findOne({ item_id: warrantyDto.item_id, status: 1 })
            .exec();
        if (warrantycheck) {
            throw new BadRequestException('Item Warranty already exists');
        }
        // Create Warranty Id
        const warranty_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.WARRANTY,
        );
        const warranty = new Warranty();
        warranty.warranty_id = warranty_id;
        warranty.warranty_code = warrantyDto.warranty_code;
        warranty.item_id = warrantyDto.item_id;
        warranty.warranty_duration = warrantyDto.warranty_duration;
        warranty.max_claims = warrantyDto.max_claims;
        warranty.created_at = AppUtils.getIsoUtcMoment();
        warranty.updated_at = AppUtils.getIsoUtcMoment();
        warranty.created_by = loggedInUser.user_id;
        warranty.updated_by = loggedInUser.user_id;
        try {
            await this.warrantyModel.create(warranty);
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.WARRANTY);
            return { status: false, data: e };
        }
    }

    // GET All Item Warranties list
    async getWarranty(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            params.warranty_code = { $regex: search };
        }
        const count = await this.warrantyModel.count(params).exec();
        const list = await this.warrantyModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Warranty by Id
    async getWarrantyById(id: string, loggedInUser: User) {
        const warranty = await this.warrantyModel
            .findOne({ warranty_id: id })
            .exec();
        return warranty;
    }

    // GET Warranty by Item
    async getWarrantyByItemId(item_id: string, loggedInUser: User) {
        const warranty = await this.itemModel.aggregate([
            { $match: { item_id: item_id, status: 1 } },
            {
                $lookup: {
                    from: 'models',
                    localField: 'model_id',
                    foreignField: 'model_id',
                    as: 'models_doc',
                },
            },
            { $unwind: '$models_doc' },
            {
                $project: {
                    item_id: '$item_id',
                    model_id: '$model_id',
                    product_id: '$models_doc.product_id',
                    company_id: '$models_doc.company_id',
                },
            },
        ]).exec()
        return warranty;
    }

    // GET Warranty by Model
    async getWarrantyByModelId(model_id: string, loggedInUser: User) {
        const itemobjects = await this.itemModel.find({ model_id: model_id, status: 1 });
        var items = [];
        for (let i = 0; i < itemobjects.length; i++) {
            items.push(itemobjects[i].item_id);
        }
        const list = await this.warrantyModel.aggregate([
            { $match: { item_id: { $in: items }, status: 1 } },
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
                $project: {
                    warranty_id: '$warranty_id',
                    warranty_code: '$warranty_code',
                    item_id: '$item_id',
                    serial_number: '$items_doc.serial_number',
                    item_purchase: '$item_purchase',
                    warranty_duration: '$warranty_duration',
                    max_claims: '$max_claims',
                    claims: '$claims',
                    start_date: '$start_date',
                    end_date: '$end_date',
                    created_at: '$created_at',
                    created_by: '$created_by',
                    updated_at: '$updated_at',
                    updated_by: '$updated_by',
                    status: '$status',
                },
            }
        ]).exec();
        const count = list.length;
        return { list, count };
    }

    // Update Warranty by Id
    async updateWarranty(
        warranty_id: string,
        warrantyDto: WarrantyDto,
        loggedInUser: User,
    ) {
        const warranty = await this.warrantyModel.findOne({ warranty_id }).exec();
        if (!warranty) {
            throw new NotFoundException('Item Warranty not found');
        }
        warranty.warranty_code = warrantyDto.warranty_code;
        warranty.item_id = warrantyDto.item_id;
        warranty.warranty_duration = warrantyDto.warranty_duration;
        warranty.max_claims = warrantyDto.max_claims;
        warranty.updated_at = AppUtils.getIsoUtcMoment();
        warranty.updated_by = loggedInUser.user_id;
        return this.warrantyModel.updateOne({ warranty_id }, warranty);
    }

    // Delete Warranty by Id
    async deleteWarranty(warranty_id: string, loggedInUser: User) {
        const warranty = await this.warrantyModel.findOne({ warranty_id }).exec();
        if (!warranty) {
            throw new NotFoundException('Item Warranty not found');
        }
        await this.warrantyModel.updateOne({ warranty_id }, { status: 0 });
        return;
    }

    // Restore Warranty by Id
    async restoreWarranty(warranty_id: string, loggedInUser: User) {
        const warranty = await this.warrantyModel.findOne({ warranty_id }).exec();
        if (!warranty) {
            throw new NotFoundException('Item Warranty not found');
        }
        await this.warrantyModel.updateOne({ warranty_id }, { status: 1 });
        return;
    }

    // Add Claim
    async addClaim(claimDto: ClaimDto, loggedInUser: User) {

        // Check Warranty Duration
        const warranty = await this.getWarrantyById(claimDto.warranty_id, loggedInUser);
        var claim_valid: boolean;
        if (new Date(warranty.end_date) > new Date()) {
            claim_valid = true;
        } else {
            claim_valid = false;
        }

        // Create Claim Id
        const claim_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.CLAIM,
        );
        const claim = new Claim();
        claim.claim_id = claim_id;
        claim.warranty_id = claimDto.warranty_id;
        claim.complaint_id = claimDto.complaint_id;
        claim.claim_valid = claim_valid;
        claim.created_at = AppUtils.getIsoUtcMoment();
        claim.updated_at = AppUtils.getIsoUtcMoment();
        claim.created_by = loggedInUser.user_id;
        claim.updated_by = loggedInUser.user_id;
        try {
            await this.claimModel.create(claim);
            await this.warrantyModel.updateOne({ warranty_id: claimDto.warranty_id }, { $inc: { claims: 1 } })
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.CLAIM);
            return { status: false, data: e };
        }
    }

    // GET All Warranty Claims By Item
    async getClaimsByItemId(
        loggedInUser: User,
        item_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            // params.warranty_code = { $regex: search };
        }
        const list = await this.claimModel.aggregate([
            { $match: { status: 1 } },
            {
                $lookup: {
                    from: 'items',
                    localField: item_id,
                    foreignField: 'item_id',
                    as: 'items_doc',
                },
            },
            { $unwind: '$items_doc' },
            {
                $lookup: {
                    from: 'warranties',
                    localField: 'warranty_id',
                    foreignField: 'warranty_id',
                    as: 'warranty_doc',
                },
            },
            { $unwind: '$warranty_doc' },
            {
                $project: {
                    claim_id: '$claim_id',
                    warranty_id: '$warranty_id',
                    complaint_id: '$complaint_id',
                    item_id: '$items_doc.item_id',
                    serial_number: '$items_doc.serial_number',
                    warranty_code: '$warranty_doc.warranty_code',
                    claim_status: '$claim_status',
                    created_at: '$created_at',
                    created_by: '$created_by',
                    updated_at: '$updated_at',
                    updated_by: '$updated_by',
                    status: '$status',
                },
            },
            { $limit: limit },
        ]).skip((page - 1) * limit).exec();
        const count = list.length;
        return { list, count };
    }

    // GET Claim details by Item
    async getClaimByComplaintId(complaint_id: string, loggedInUser: User) {
        const claim = await this.itemModel.aggregate([
            { $match: { complaint_id: complaint_id, status: 1 } },
            {
                $lookup: {
                    from: 'warranties',
                    localField: 'warranty_id',
                    foreignField: 'warranty_id',
                    as: 'warranty_doc',
                },
            },
            { $unwind: '$warranty_doc' },
            {
                $lookup: {
                    from: 'items',
                    localField: 'warranty_doc.item_id',
                    foreignField: 'item_id',
                    as: 'item_doc',
                },
            },
            { $unwind: '$item_doc' },
            {
                $lookup: {
                    from: 'models',
                    localField: 'item_doc.model_id',
                    foreignField: 'model_id',
                    as: 'models_doc',
                },
            },
            { $unwind: '$models_doc' },
            {
                $project: {
                    item_id: '$item_doc.item_id',
                    model_id: '$item_doc.model_id',
                    product_id: '$models_doc.product_id',
                    company_id: '$models_doc.company_id',
                },
            },
        ]).exec()
        return claim;
    }

    // GET All Warranty Claims By Warranty
    async getClaimsByWarrantyId(
        loggedInUser: User,
        warranty_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { warranty_id: warranty_id, status: 1 };
        if (search) {
            params.complaint_id = { $regex: search };
        }
        const count = await this.claimModel.count(params).exec();
        const list = await this.claimModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Warranty Claim by Id
    async getClaimById(id: string, loggedInUser: User) {
        const claim = await this.claimModel
            .findOne({ claim_id: id })
            .exec();
        return claim;
    }

    // Update Warranty Claim by Id
    async updateClaim(
        claim_id: string,
        claimDto: ClaimDto,
        loggedInUser: User,
    ) {
        const claim = await this.claimModel.findOne({ claim_id }).exec();
        if (!claim) {
            throw new NotFoundException('Item Warranty Claim not found');
        }
        claim.warranty_id = claimDto.warranty_id;
        claim.complaint_id = claimDto.complaint_id;
        claim.updated_at = AppUtils.getIsoUtcMoment();
        claim.updated_by = loggedInUser.user_id;
        return this.claimModel.updateOne({ claim_id }, claim);
    }

    // Update Warranty Claim Status by Id
    async updateClaimStatus(
        claim_status: ClaimStatus,
        claim_id: string,
        loggedInUser: User,
    ) {
        const claim = await this.claimModel.findOne({ claim_id }).exec();
        if (!claim) {
            throw new NotFoundException('Item Warranty Claim not found');
        }
        claim.claim_status = claim_status;
        claim.updated_at = AppUtils.getIsoUtcMoment();
        claim.updated_by = loggedInUser.user_id;
        return this.claimModel.updateOne({ claim_id }, claim);
    }

    // Delete Warranty Claim by Id
    async deleteClaim(claim_id: string, loggedInUser: User) {
        const claim = await this.claimModel.findOne({ claim_id }).exec();
        if (!claim) {
            throw new NotFoundException('Item Warranty Claim not found');
        }
        await this.claimModel.updateOne({ claim_id }, { status: 0 });
        return;
    }

    // Restore Warranty Claim by Id
    async restoreClaim(claim_id: string, loggedInUser: User) {
        const claim = await this.claimModel.findOne({ claim_id }).exec();
        if (!claim) {
            throw new NotFoundException('Item Warranty Claim not found');
        }
        await this.claimModel.updateOne({ claim_id }, { status: 1 });
        return;
    }

}
