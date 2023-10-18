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
import { ReviewDto } from './dto/review.dto';
import { ReviewService } from './review.service';

@Controller({
    path: 'review',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Review')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class ReviewController {
    constructor(private readonly reviewservice: ReviewService) { }

    // Add Review
    @Post('/addReview')
    @ApiOperation({ summary: 'Add Review' })
    @ApiOkResponse({
        description: 'Review added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addReview(@Body() reviewDto: ReviewDto, @Request() req) {
        const review = await this.reviewservice.addReview(
            reviewDto,
            req.user,
        );
        if (review.status == true) {
            return { message: 'Review added successfully' };
        } else {
            throw new NotImplementedException(review.data);
        }
    }

    // Update Review
    @Put('/:review_id')
    @ApiOperation({ summary: 'Update Review' })
    @ApiOkResponse({
        description: 'Review updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateReview(
        @Request() req,
        @Param('review_id') review_id: string,
        @Body() reviewDto: ReviewDto,
    ) {
        await this.reviewservice.updateReview(
            review_id,
            reviewDto,
            req.user,
        );
        return { message: 'Review updated successfully', data: true };
    }

    // GET All Reviews by Review Type 
    @Get('/getReviews/:id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Reviews' })
    @ApiOkResponse({
        description: 'Reviews fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getReviews(
        @Request() req,
        @Param('id') id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const reviews = await this.reviewservice.getReviews(
            req.user,
            id,
            page,
            limit,
            search,
        );
        return { message: 'Reviews fetched successfully', data: reviews };
    }

    // GET Review by Id
    @Get('/getReviewById/:review_id')
    @ApiOperation({ summary: 'Get Review By Id' })
    @ApiOkResponse({
        description: 'Review fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getReviewById(
        @Request() req,
        @Param('review_id') review_id: string,
    ) {
        const review = await this.reviewservice.getReviewById(
            review_id,
            req.user,
        );
        return { message: 'Review fetched successfully', data: review };
    }

    // Delete Review
    @Delete('/:review_id')
    @ApiOperation({ summary: 'Delete Review' })
    @ApiOkResponse({
        description: 'Review deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteReview(@Request() req, @Param('review_id') review_id: string) {
        await this.reviewservice.deleteReview(
            review_id,
            req.user,
        );
        return { message: 'Review deleted successfully', data: true };
    }

    // Restore Review
    @Put('/restore_review/:review_id')
    @ApiOperation({ summary: 'Restore Review' })
    @ApiOkResponse({
        description: 'Review restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreReview(
        @Request() req,
        @Param('review_id') review_id: string,
    ) {
        await this.reviewservice.restoreReview(
            review_id,
            req.user,
        );
        return { message: 'Review restored successfully', data: true };
    }
}

