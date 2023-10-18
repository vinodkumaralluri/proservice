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
import { RatingDto } from './dto/rating.dto';
import { RatingService } from './rating.service';

@Controller({
    path: 'rating',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Rating')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class RatingController {
    constructor(private readonly ratingservice: RatingService) { }

    // Add Rating
    @Post('/addRating')
    @ApiOperation({ summary: 'Add Rating' })
    @ApiOkResponse({
        description: 'Rating added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addRating(@Body() ratingDto: RatingDto, @Request() req) {
        const rating = await this.ratingservice.addRating(
            ratingDto,
            req.user,
        );
        if (rating.status == true) {
            return { message: 'Rating added successfully' };
        } else {
            throw new NotImplementedException(rating.data);
        }
    }

    // Update Rating
    @Put('/:rating_id')
    @ApiOperation({ summary: 'Update Rating' })
    @ApiOkResponse({
        description: 'Rating updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateRating(
        @Request() req,
        @Param('rating_id') rating_id: string,
        @Body() ratingDto: RatingDto,
    ) {
        await this.ratingservice.updateRating(
            rating_id,
            ratingDto,
            req.user,
        );
        return { message: 'Rating updated successfully', data: true };
    }

    // GET All Ratings by Rating Type 
    @Get('/getRatings/:id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Ratings' })
    @ApiOkResponse({
        description: 'Ratings fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getRatings(
        @Request() req,
        @Param('id') id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const ratings = await this.ratingservice.getRatings(
            req.user,
            id,
            page,
            limit,
            search,
        );
        return { message: 'Reviews fetched successfully', data: ratings };
    }

    // GET Rating by Id
    @Get('/getRatingById/:rating_id')
    @ApiOperation({ summary: 'Get Rating By Id' })
    @ApiOkResponse({
        description: 'Rating fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getRatingById(
        @Request() req,
        @Param('rating_id') rating_id: string,
    ) {
        const rating = await this.ratingservice.getRatingById(
            rating_id,
            req.user,
        );
        return { message: 'Rating fetched successfully', data: rating };
    }

    // Delete Rating
    @Delete('/:rating_id')
    @ApiOperation({ summary: 'Delete Rating' })
    @ApiOkResponse({
        description: 'Rating deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteRating(@Request() req, @Param('rating_id') rating_id: string) {
        await this.ratingservice.deleteRating(
            rating_id,
            req.user,
        );
        return { message: 'Rating deleted successfully', data: true };
    }

    // Restore Rating
    @Put('/restore_review/:rating_id')
    @ApiOperation({ summary: 'Restore Rating' })
    @ApiOkResponse({
        description: 'Rating restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreRating(
        @Request() req,
        @Param('rating_id') rating_id: string,
    ) {
        await this.ratingservice.restoreRating(
            rating_id,
            req.user,
        );
        return { message: 'Rating restored successfully', data: true };
    }
}


