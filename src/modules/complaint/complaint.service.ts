import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { AppConstant } from '../../utils/app.constants';
import { AppUtils } from '../../utils/app.utils';
import { Complaint, ComplaintDocument } from './schemas/complaint.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { Models, ModelsDocument } from '../model/schemas/model.schema';
import { Item, ItemDocument } from '../item/schemas/item.schema';
import { ServiceCenter, ServiceCenterDocument } from '../service-center/schemas/service-center.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { ComplaintDto } from './dto/complaint.dto';
import { User } from '../users/schemas/user.schema';
import { AssignComplaintDto } from './dto/assignComplaint.dto';

@Injectable()
export class ComplaintService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Complaint.name) private complaintModel: Model<ComplaintDocument>,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        @InjectModel(Models.name) private modelModel: Model<ModelsDocument>,
        @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
        @InjectModel(ServiceCenter.name) private servicecenterModel: Model<ServiceCenterDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Complaint
    async queryComplaint(filter: any) {
        const complaint = await this.complaintModel.findOne(filter).exec();
        return complaint;
    }

    // Add Complaint
    async addComplaint(complaintDto: ComplaintDto, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Complaint
        const complaintcheck = await this.complaintModel
            .findOne({ invoice_number: complaintDto.invoice_number, status: 1 })
            .exec();
        if (complaintcheck) {
            throw new BadRequestException('Complaint already exists');
        }
        // Create Complaint Id
        const complaint_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.COMPLAINT,
            transactionSession,
        );
        const complaint = new Complaint();
        complaint.complaint_id = complaint_id;
        complaint.item_id = complaintDto.item_id;
        complaint.invoice_number = complaintDto.invoice_number;
        complaint.problem_type = complaintDto.problem_type;
        complaint.complaint = complaintDto.complaint;
        complaint.purchase_date = complaintDto.purchase_date;
        complaint.created_at = AppUtils.getIsoUtcMoment();
        complaint.updated_at = AppUtils.getIsoUtcMoment();
        complaint.created_by = loggedInUser.user_id;
        complaint.updated_by = loggedInUser.user_id;
        try {
            await this.complaintModel.create([complaint], { transactionSession });
            // GET Model Id from Item Model
            const item = await this.itemModel.aggregate([
                { $match: { item_id: complaintDto.item_id } },
                {
                    $lookup: {
                        from: 'models',
                        localField: 'model_id',
                        foreignField: 'model_id',
                        as: 'model_doc',
                    },
                },
                {
                    $project: {
                        model_id: '$model_id',
                        product_id: '$model_doc.product_id',
                        company_id: '$model_doc.company_id',
                    }
                }
            ])
            // Update Complaints count in Company Model
            await this.companyModel.findOneAndUpdate([{ company_id: item[0].company_id, status: 1 }, { $inc: { complaints: 1 } }], { transactionSession });
            // Update Complaints count in Mode
            await this.modelModel.findOneAndUpdate([{ model_id: item[0].model_id, status: 1 }, { $inc: { complaints: 1 } }], { transactionSession });
            // Update Complaints count in Item
            await this.itemModel.findOneAndUpdate([{ item_id: complaintDto.item_id, status: 1 }, { $inc: { complaints: 1 } }], { transactionSession });
            // Commit the Transaction
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }
    }

    // GET All Complaints
    async getComplaints(
        loggedInUser: User,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            params.invoice_number = { $regex: search };
        }
        const list = await this.companyModel.aggregate([
            { $match: params },
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
            { $unwind: '$models_doc' }, {
                $lookup: {
                    from: 'products',
                    localField: 'models_doc.product_id',
                    foreignField: 'product_id',
                    as: 'products_doc',
                },
            },
            { $unwind: '$products_doc' },
            { $limit: limit },
            {
                $project: {
                    complaint_id: '$complaint_id',
                    item_id: '$item_id',
                    serial_number: '$items_doc.serial_number',
                    model_number: '$models_doc.model_number',
                    product_name: '$products_doc.product_name',
                    invoice_number: '$invoice_number',
                    problem_type: '$problem_type',
                    complaint: '$complaint',
                    created_at: '$created_at',
                    created_by: '$created_by',
                    updated_at: '$updated_at',
                    updated_by: '$updated_by',
                    status: '$status',
                },
            }
        ]).skip((page - 1) * limit).exec()
        const count = list.length;
        return { list, count };
    }

    // GET All Complaints list
    async getComplaintsByItemId(
        loggedInUser: User,
        item_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { item_id: item_id, status: 1 };
        if (search) {
            params.invoice_number = { $regex: search };
        }
        const count = await this.complaintModel.count(params).exec();
        const list = await this.complaintModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET All Complaints By Company Id
    async getComplaintsByCompanyId(
        loggedInUser: User,
        company_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const list = await this.complaintModel.aggregate([
            { $match: { status: 1 } },
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
            { $match: { 'models_doc.company_id': company_id } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'models_doc.product_id',
                    foreignField: 'product_id',
                    as: 'products_doc',
                },
            },
            { $unwind: '$products_doc' },
            { $limit: limit },
            {
                $project: {
                    complaint_id: '$complaint_id',
                    item_id: '$item_id',
                    serial_number: '$items_doc.serial_number',
                    model_number: '$models_doc.model_number',
                    product_name: '$products_doc.product_name',
                    invoice_number: '$invoice_number',
                    problem_type: '$problem_type',
                    complaint: '$complaint',
                    created_at: '$created_at',
                    created_by: '$created_by',
                    updated_at: '$updated_at',
                    updated_by: '$updated_by',
                    status: '$status',
                },
            }
        ]).skip((page - 1) * limit).exec();
        const count = list.length;
        return { list, count };
    }

    // GET All Complaints By Product Id
    async getComplaintsByProductId(
        loggedInUser: User,
        product_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const list = await this.complaintModel.aggregate([
            { $match: { status: 1 } },
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
            { $match: { 'models_doc.product_id': product_id } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'models_doc.product_id',
                    foreignField: 'product_id',
                    as: 'products_doc',
                },
            },
            { $unwind: '$products_doc' },
            { $limit: limit },
            {
                $project: {
                    complaint_id: '$complaint_id',
                    item_id: '$item_id',
                    serial_number: '$items_doc.serial_number',
                    model_number: '$models_doc.model_number',
                    product_name: '$products_doc.product_name',
                    invoice_number: '$invoice_number',
                    problem_type: '$problem_type',
                    complaint: '$complaint',
                    created_at: '$created_at',
                    created_by: '$created_by',
                    updated_at: '$updated_at',
                    updated_by: '$updated_by',
                    status: '$status',
                },
            }
        ]).skip((page - 1) * limit).exec();
        const count = list.length;
        return { list, count };
    }

    // GET All Complaints By Model Id
    async getComplaintsByModelId(
        loggedInUser: User,
        model_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const list = await this.complaintModel.aggregate([
            { $match: { status: 1 } },
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
            { $match: { 'models_doc.model_id': model_id } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'models_doc.product_id',
                    foreignField: 'product_id',
                    as: 'products_doc',
                },
            },
            { $unwind: '$products_doc' },
            { $limit: limit },
            {
                $project: {
                    complaint_id: '$complaint_id',
                    item_id: '$item_id',
                    serial_number: '$items_doc.serial_number',
                    model_number: '$models_doc.model_number',
                    product_name: '$products_doc.product_name',
                    invoice_number: '$invoice_number',
                    problem_type: '$problem_type',
                    complaint: '$complaint',
                    created_at: '$created_at',
                    created_by: '$created_by',
                    updated_at: '$updated_at',
                    updated_by: '$updated_by',
                    status: '$status',
                },
            }
        ]).skip((page - 1) * limit).exec();
        const count = list.length;
        return { list, count };
    }

    // GET Complaint by Id
    async getComplaintById(
        loggedInUser: User,
        complaint_id: string,
    ) {
        const complaint = await this.complaintModel
            .findOne({ complaint_id: complaint_id })
            .exec();
        return complaint;
    }

    // Update Complaint by Id
    async updateComplaint(
        complaint_id: string,
        complaintDto: ComplaintDto,
        loggedInUser: User,
    ) {
        const complaint = await this.complaintModel.findOne({ complaint_id }).exec();
        if (!complaint) {
            throw new NotFoundException('Complaint not found');
        }

        complaint.item_id = complaintDto.item_id;
        complaint.invoice_number = complaintDto.invoice_number;
        complaint.problem_type = complaintDto.problem_type;
        complaint.complaint = complaintDto.complaint;
        complaint.purchase_date = complaintDto.purchase_date;
        complaint.updated_at = AppUtils.getIsoUtcMoment();
        complaint.updated_by = loggedInUser.user_id;
        return this.complaintModel.updateOne({ complaint_id }, complaint);
    }

    // Assign Complaint to the Service Center
    async assignComplaint(
        complaint_id: string,
        assigncomplaintDto: AssignComplaintDto,
        loggedInUser: User,
    ) {
        const complaint = await this.complaintModel.findOne({ complaint_id }).exec();
        if (!complaint) {
            throw new NotFoundException('Complaint not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        complaint.servicecenter_id = assigncomplaintDto.servicecenter_id;
        complaint.updated_at = AppUtils.getIsoUtcMoment();
        complaint.updated_by = loggedInUser.user_id;
        await this.complaintModel.updateOne([{ complaint_id }, complaint], { transactionSession });
        return this.servicecenterModel.updateOne([{
            servicecenter_id: assigncomplaintDto.servicecenter_id
        }, {
            $inc: { complaints_assigned: 1, complaints_pending: 1 }
        }],
            { transactionSession }
        );
    }

    // Delete Complaint by Id
    async deleteComplaint(complaint_id: string, loggedInUser: User) {
        const complaint = await this.complaintModel.findOne({ complaint_id }).exec();
        if (!complaint) {
            throw new NotFoundException('Complaint not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        await this.complaintModel.updateOne([{ complaint_id }, { status: 0 }], { transactionSession });
        const Item = await this.itemModel.findOneAndUpdate([{ item_id: complaint.item_id, status: 1 }, { $inc: { complaints: -1 } }], { transactionSession });
        const model = await this.modelModel.findOneAndUpdate([{ model_id: Item.model_id, status: 1 }, { $inc: { complaints: -1 } }], { transactionSession });
        const company = await this.companyModel.findOneAndUpdate([{ company_id: model.company_id, status: 1 }, { $inc: { complaints: -1 } }], { transactionSession });
        return;
    }

    // Restore Complaint by Id
    async restoreComplaint(complaint_id: string, loggedInUser: User) {
        const complaint = await this.complaintModel.findOne({ complaint_id }).exec();
        if (!complaint) {
            throw new NotFoundException('Complaint not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        await this.complaintModel.updateOne([{ complaint_id }, { status: 1 }], {transactionSession});
        const Item = await this.itemModel.findOneAndUpdate([{ item_id: complaint.item_id, status: 1 }, { $inc: { complaints: 1 } }], {transactionSession});
        const model = await this.modelModel.findOneAndUpdate([{ model_id: Item.model_id, status: 1 }, { $inc: { complaints: 1 } }], {transactionSession});
        const company = await this.companyModel.findOneAndUpdate([{ company_id: model.company_id, status: 1 }, { $inc: { complaints: 1 } }], {transactionSession});
        return;
    }

}






