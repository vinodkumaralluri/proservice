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
import { FactoryDto } from './dto/factory.dto';
import { FactoryService } from './factory.service';

@Controller({
    path: 'factory',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Factory')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class FactoryController {
    constructor(private readonly factoryservice: FactoryService) { }

    // Add Factory
    @Post('/addFactory')
    @ApiOperation({ summary: 'Add Factory' })
    @ApiOkResponse({
        description: 'Factory added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addFactory(@Body() factoryDto: FactoryDto, @Request() req) {
        const factory = await this.factoryservice.addFactory(
            factoryDto,
            req.user,
        );
        if (factory.status == true) {
            return { message: 'Factory added successfully' };
        } else {
            throw new NotImplementedException(factory.data);
        }
    }

    // Update Factory
    @Put('/editFactory/:factory_id')
    @ApiOperation({ summary: 'Update Factory' })
    @ApiOkResponse({
        description: 'Factory updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateFactory(
        @Request() req,
        @Param('factory_id') factory_id: string,
        @Body() factoryDto: FactoryDto,
    ) {
        await this.factoryservice.updateFactory(
            factory_id,
            factoryDto,
            req.user,
        );
        return { message: 'Factory updated successfully', data: true };
    }

    // GET All Factories list
    @Get('/getFactories/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Factories' })
    @ApiOkResponse({
        description: 'Factories fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getFactories(
        @Request() req,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const factories = await this.factoryservice.getFactories(
            req.user,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Factories fetched successfully', data: factories };
    }

    // GET Factory by Id
    @Get('/getFactoryById/:factory_id')
    @ApiOperation({ summary: 'Get Factory By Id' })
    @ApiOkResponse({
        description: 'Factory fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getFactoryById(
        @Request() req,
        @Param('factory_id') factory_id: string,
    ) {
        const factory = await this.factoryservice.getFactoryById(
            factory_id,
            req.user,
        );
        return { message: 'Factory fetched successfully', data: factory };
    }

    // Delete Factory
    @Delete('/deleteFactory/:factory_id')
    @ApiOperation({ summary: 'Delete Factory' })
    @ApiOkResponse({
        description: 'Factory deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteFactory(@Request() req, @Param('factory_id') factory_id: string) {
        await this.factoryservice.deleteFactory(
            factory_id,
            req.user,
        );
        return { message: 'Factory deleted successfully', data: true };
    }

    // Restore Factory
    @Delete('/restoreFactory/:factory_id')
    @ApiOperation({ summary: 'Restore Factory' })
    @ApiOkResponse({
        description: 'Factory restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreFactory(
        @Request() req,
        @Param('factory_id') factory_id: string,
    ) {
        await this.factoryservice.restoreFactory(
            factory_id,
            req.user,
        );
        return { message: 'Factory restored successfully', data: true };
    }
}










