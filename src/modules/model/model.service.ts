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
import { Models, ModelsDocument } from './schemas/model.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { ModelDto } from './dto/model.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ModelService {
    constructor(
        @InjectModel(Models.name) private modelModel: Model<ModelsDocument>,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Model
    async queryModel(filter: any) {
        const model = await this.modelModel.findOne(filter).exec();
        return model;
    }

    // Add Model
    async addModel(modelDto: ModelDto, loggedInUser: User) {
        // Check for Model Name
        const modelcheck = await this.modelModel
            .findOne({ model_number: modelDto.model_number, status: 1 })
            .exec();
        if (modelcheck) {
            throw new BadRequestException('Model already exists');
        }
        // Check for Product
        const productCheck = await this.modelModel.find({product_id: modelDto.product_id, status: 1});

        // Create Model Id
        const model_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.MODEL,
        );
        const model = new Models();    
        model.model_id = model_id;
        model.product_id = modelDto.product_id;
        model.company_id = modelDto.company_id;
        model.model_number = modelDto.model_number;
        model.created_at = AppUtils.getIsoUtcMoment();
        model.updated_at = AppUtils.getIsoUtcMoment();
        model.created_by = loggedInUser.user_id;
        model.updated_by = loggedInUser.user_id;
        try {
            await this.modelModel.create(model);
            if (!productCheck) {
                await this.companyModel.updateOne({company_id: modelDto.company_id}, {$inc: {products: 1}});
            }            
            return { status: true, data: 'success' };
        } catch (e) {
            console.log(e)
            await this.autoIncrementService.getprevious(AutoIncrementEnum.MODEL);
            return { status: false, data: e };
        }
    }

    // GET All Models list
    async getModels(
        loggedInUser: User,
        product_id: string,
        company_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { product_id: product_id, company_id: company_id, status: 1 };
        if (search) {
            params.model_number = { $regex: search };
        }
        const count = await this.modelModel.count(params).exec();
        const list = await this.modelModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Model by Id
    async getModelById(id: string, loggedInUser: User) {
        const model = await this.modelModel
            .findOne({ model_id: id })
            .exec();
        return model;
    }

    // Update Model by Id
    async updateModel(
        model_id: string,
        modelDto: ModelDto,
        loggedInUser: User,
    ) {
        const model = await this.modelModel.findOne({ model_id }).exec();
        if (!model) {
            throw new NotFoundException('Model not found');
        }
        model.product_id = modelDto.product_id;
        model.company_id = modelDto.company_id;
        model.model_number = modelDto.model_number;
        model.updated_at = AppUtils.getIsoUtcMoment();
        model.updated_by = loggedInUser.user_id;
        return this.modelModel.updateOne({ model_id }, model);
    }

    // Delete Model by Id
    async deleteModel(model_id: string, loggedInUser: User) {
        const model = await this.modelModel.findOne({ model_id }).exec();
        if (!model) {
            throw new NotFoundException('Model not found');
        }
        await this.modelModel.updateOne({ model_id }, { status: 0 });
        return;
    }

    // Restore Model by Id
    async restoreModel(model_id: string, loggedInUser: User) {
        const model = await this.modelModel.findOne({ model_id }).exec();
        if (!model) {
            throw new NotFoundException('Model not found');
        }
        await this.modelModel.updateOne({ model_id }, { status: 1 });
        return;
    }

}





