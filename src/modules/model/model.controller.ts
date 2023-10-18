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
import { ModelDto } from './dto/model.dto';
import { ModelService } from './model.service';

@Controller({
    path: 'model',
    version: '1',
})
@ApiTags('Model')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class ModelController {
    constructor(private readonly modelservice: ModelService) { }

    // Add Model
    @Post('/addModel')
    @ApiOperation({ summary: 'Add Model' })
    @ApiOkResponse({
        description: 'Model added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addModel(@Body() modelDto: ModelDto, @Request() req) {
        const model = await this.modelservice.addModel(
            modelDto,
            req.user,
        );
        if (model.status == true) {
            return { message: 'Model added successfully' };
        } else {
            throw new NotImplementedException(model.data);
        }
    }

    // Update Model
    @Put('/editModel/:model_id')
    @ApiOperation({ summary: 'Update Model' })
    @ApiOkResponse({
        description: 'Model updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateModel(
        @Request() req,
        @Param('model_id') model_id: string,
        @Body() modelDto: ModelDto,
    ) {
        await this.modelservice.updateModel(
            model_id,
            modelDto,
            req.user,
        );
        return { message: 'Model updated successfully', data: true };
    }

    // GET All Models list
    @Get('/getModels/:product_id/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Models' })
    @ApiOkResponse({
        description: 'Models fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getModels(
        @Request() req,
        @Param('product_id') product_id: string,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const models = await this.modelservice.getModels(
            req.user,
            product_id,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Models fetched successfully', data: models };
    }

    // GET Model by Id
    @Get('/getModelById/:model_id')
    @ApiOperation({ summary: 'Get Model By Id' })
    @ApiOkResponse({
        description: 'Model fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getModelById(
        @Request() req,
        @Param('model_id') model_id: string,
    ) {
        const model = await this.modelservice.getModelById(
            model_id,
            req.user,
        );
        return { message: 'Model fetched successfully', data: model };
    }

    // Delete Model
    @Delete('/deleteModel/:model_id')
    @ApiOperation({ summary: 'Delete Model' })
    @ApiOkResponse({
        description: 'Model deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteModel(@Request() req, @Param('model_id') model_id: string) {
        await this.modelservice.deleteModel(
            model_id,
            req.user,
        );
        return { message: 'Model deleted successfully', data: true };
    }

    // Restore Model
    @Delete('/restoreModel/:model_id')
    @ApiOperation({ summary: 'Restore Model' })
    @ApiOkResponse({
        description: 'Model restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreModel(
        @Request() req,
        @Param('model_id') model_id: string,
    ) {
        await this.modelservice.restoreModel(
            model_id,
            req.user,
        );
        return { message: 'Model restored successfully', data: true };
    }
}









