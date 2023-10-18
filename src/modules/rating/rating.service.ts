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
import { Rating, RatingDocument } from './schemas/rating.schema';
import { Models, ModelsDocument } from '../model/schemas/model.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { Store, StoreDocument } from '../store/schemas/store.schema';
import { ServiceCenter, ServiceCenterDocument } from '../service-center/schemas/service-center.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { RatingDto } from './dto/rating.dto';
import { User } from '../users/schemas/user.schema';
import { ModuleType } from 'src/enums/module-type.enum';

@Injectable()
export class RatingService {
    constructor(
        @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
        @InjectModel(Models.name) private modelModel: Model<ModelsDocument>,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
        @InjectModel(ServiceCenter.name) private servicecenterModel: Model<ServiceCenterDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Rating
    async queryRating(filter: any) {
        const rating = await this.ratingModel.findOne(filter).exec();
        return rating;
    }

    // Add Rating
    async addRating(ratingDto: RatingDto, loggedInUser: User) {

        // Check for Rating
        const ratingcheck = await this.ratingModel
            .findOne({ customer_id: ratingDto.customer_id, rating_about: ratingDto.rating_about, status: 1 })
            .exec();
        if (ratingcheck) {
            throw new BadRequestException('Rating already exists');
        }
        // Create Rating Id
        const rating_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.RATING,
        );
        const rating = new Rating();
        rating.rating_id = rating_id;
        rating.rating_type = ratingDto.rating_type;
        rating.customer_id = ratingDto.customer_id;
        rating.rating_about = ratingDto.rating_about;
        rating.rating = ratingDto.rating;
        rating.max_rating = ratingDto.max_rating;
        rating.created_at = AppUtils.getIsoUtcMoment();
        rating.updated_at = AppUtils.getIsoUtcMoment();
        rating.created_by = loggedInUser.user_id;
        rating.updated_by = loggedInUser.user_id;
        try {
            await this.ratingModel.create(rating);
            await this.modelModel.findOneAndUpdate({model_id: ratingDto.rating_about, status: 1}, { $inc: { ratings: 1 } });
            await this.companyModel.findOneAndUpdate({company_id: ratingDto.rating_about, status: 1}, { $inc: { reviews: 1 } });
            await this.storeModel.findOneAndUpdate({store_id: ratingDto.rating_about, status: 1}, { $inc: { reviews: 1 } });
            await this.servicecenterModel.findOneAndUpdate({servicecenter_id: ratingDto.rating_about, status: 1}, { $inc: { reviews: 1 } });
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.RATING);
            return { status: false, data: e };
        }
    }

    // GET All Ratings
    async getRatings(
        loggedInUser: User,
        id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { rating_about: id, status: 1 };
        if (search) {
            params.rating = { $regex: search };
        }
        const count = await this.ratingModel.count(params).exec();
        const list = await this.ratingModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Rating by Id
    async getRatingById(id: string, loggedInUser: User) {
        const rating = await this.ratingModel
            .findOne({ rating_id: id })
            .exec();
        return rating;
    }

    // Update Rating by Id
    async updateRating(
        rating_id: string,
        ratingDto: RatingDto,
        loggedInUser: User,
    ) {
        const rating = await this.ratingModel.findOne({ rating_id }).exec();
        if (!rating) {
            throw new NotFoundException('Rating not found');
        }
        rating.rating_type = ratingDto.rating_type;
        rating.customer_id = ratingDto.customer_id;
        rating.rating_about = ratingDto.rating_about;
        rating.rating = ratingDto.rating;
        rating.max_rating = ratingDto.max_rating;
        rating.updated_at = AppUtils.getIsoUtcMoment();
        rating.updated_by = loggedInUser.user_id;
        return this.ratingModel.updateOne({ rating_id }, rating);
    }

    // Delete Rating by Id
    async deleteRating(rating_id: string, loggedInUser: User) {
        const rating = await this.ratingModel.findOne({ rating_id }).exec();
        if (!rating) {
            throw new NotFoundException('Rating not found');
        }
        await this.ratingModel.updateOne({ rating_id }, { status: 0 });

        await this.modelModel.findOneAndUpdate({model_id: rating.rating_about, status: 1}, { $inc: { ratings: -1 } });
        await this.companyModel.findOneAndUpdate({company_id: rating.rating_about, status: 1}, { $inc: { ratings: -1 } });
        await this.storeModel.findOneAndUpdate({store_id: rating.rating_about, status: 1}, { $inc: { ratings: -1 } });
        await this.servicecenterModel.findOneAndUpdate({servicecenter_id: rating.rating_about, status: 1}, { $inc: { ratings: -1 } });
        return;
    }

    // Restore Rating by Id
    async restoreRating(rating_id: string, loggedInUser: User) {
        const rating = await this.ratingModel.findOne({ rating_id }).exec();
        if (!rating) {
            throw new NotFoundException('Rating not found');
        }
        await this.ratingModel.updateOne({ rating_id }, { status: 1 });

        await this.modelModel.findOneAndUpdate({model_id: rating.rating_about, status: 1}, { $inc: { ratings: 1 } });
        await this.companyModel.findOneAndUpdate({company_id: rating.rating_about, status: 1}, { $inc: { ratings: 1 } });
        await this.storeModel.findOneAndUpdate({store_id: rating.rating_about, status: 1}, { $inc: { ratings: 1 } });
        await this.servicecenterModel.findOneAndUpdate({servicecenter_id: rating.rating_about, status: 1}, { $inc: { ratings: 1 } });
        return;
    }

}


