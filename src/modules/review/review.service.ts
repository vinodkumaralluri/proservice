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
import { Review, ReviewDocument } from './schemas/review.schema';
import { Models, ModelsDocument } from '../model/schemas/model.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { Store, StoreDocument } from '../store/schemas/store.schema';
import { ServiceCenter, ServiceCenterDocument } from '../service-center/schemas/service-center.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { ReviewDto } from './dto/review.dto';
import { User } from '../users/schemas/user.schema';
import { ModuleType } from 'src/enums/module-type.enum';

@Injectable()
export class ReviewService {
    constructor(
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(Models.name) private modelModel: Model<ModelsDocument>,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
        @InjectModel(ServiceCenter.name) private servicecenterModel: Model<ServiceCenterDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Review
    async queryReview(filter: any) {
        const review = await this.reviewModel.findOne(filter).exec();
        return review;
    }

    // Add Review
    async addReview(reviewDto: ReviewDto, loggedInUser: User) {

        // Check for Review
        const reviewcheck = await this.reviewModel
            .findOne({ customer_id: reviewDto.customer_id, review_about: reviewDto.review_about, status: 1 })
            .exec();
        if (reviewcheck) {
            throw new BadRequestException('Review already exists');
        }
        // Create Review Id
        const review_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.REVIEW,
        );
        const review = new Review();
        review.review_id = review_id;
        review.review_type = reviewDto.review_type;
        review.customer_id = reviewDto.customer_id;
        review.review_about = reviewDto.review_about;
        review.review = reviewDto.review;
        review.created_at = AppUtils.getIsoUtcMoment();
        review.updated_at = AppUtils.getIsoUtcMoment();
        review.created_by = loggedInUser.user_id;
        review.updated_by = loggedInUser.user_id;
        try {
            await this.reviewModel.create(review);
            await this.modelModel.findOneAndUpdate({model_id: reviewDto.review_about, status: 1}, { $inc: { reviews: 1 } });
            await this.companyModel.findOneAndUpdate({company_id: reviewDto.review_about, status: 1}, { $inc: { reviews: 1 } });
            await this.storeModel.findOneAndUpdate({store_id: reviewDto.review_about, status: 1}, { $inc: { reviews: 1 } });
            await this.servicecenterModel.findOneAndUpdate({servicecenter_id: reviewDto.review_about, status: 1}, { $inc: { reviews: 1 } });
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.REVIEW);
            return { status: false, data: e };
        }
    }

    // GET All Reviews
    async getReviews(
        loggedInUser: User,
        id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { review_about: id, status: 1 };
        if (search) {
            params.review = { $regex: search };
        }
        const count = await this.reviewModel.count(params).exec();
        const list = await this.reviewModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Review by Id
    async getReviewById(id: string, loggedInUser: User) {
        const review = await this.reviewModel
            .findOne({ review_id: id })
            .exec();
        return review;
    }

    // Update Review by Id
    async updateReview(
        review_id: string,
        reviewDto: ReviewDto,
        loggedInUser: User,
    ) {
        const review = await this.reviewModel.findOne({ review_id }).exec();
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        review.review_type = reviewDto.review_type;
        review.customer_id = reviewDto.customer_id;
        review.review_about = reviewDto.review_about;
        review.review = reviewDto.review;
        review.updated_at = AppUtils.getIsoUtcMoment();
        review.updated_by = loggedInUser.user_id;
        return this.reviewModel.updateOne({ review_id }, review);
    }

    // Delete Review by Id
    async deleteReview(review_id: string, loggedInUser: User) {
        const review = await this.reviewModel.findOne({ review_id }).exec();
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        await this.reviewModel.updateOne({ review_id }, { status: 0 });

        await this.modelModel.findOneAndUpdate({model_id: review.review_about, status: 1}, { $inc: { reviews: -1 } });
        await this.companyModel.findOneAndUpdate({company_id: review.review_about, status: 1}, { $inc: { reviews: -1 } });
        await this.storeModel.findOneAndUpdate({store_id: review.review_about, status: 1}, { $inc: { reviews: -1 } });
        await this.servicecenterModel.findOneAndUpdate({servicecenter_id: review.review_about, status: 1}, { $inc: { reviews: -1 } });
        return;
    }

    // Restore Review by Id
    async restoreReview(review_id: string, loggedInUser: User) {
        const review = await this.reviewModel.findOne({ review_id }).exec();
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        await this.reviewModel.updateOne({ review_id }, { status: 1 });

        await this.modelModel.findOneAndUpdate({model_id: review.review_about, status: 1}, { $inc: { reviews: 1 } });
        await this.companyModel.findOneAndUpdate({company_id: review.review_about, status: 1}, { $inc: { reviews: 1 } });
        await this.storeModel.findOneAndUpdate({store_id: review.review_about, status: 1}, { $inc: { reviews: 1 } });
        await this.servicecenterModel.findOneAndUpdate({servicecenter_id: review.review_about, status: 1}, { $inc: { reviews: 1 } });
        return;
    }

}

