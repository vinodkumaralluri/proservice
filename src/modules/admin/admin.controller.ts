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
import { AdminDto } from './dto/admin.dto';
import { AdminService } from './admin.service';

@Controller({
    path: 'admin',
    version: '1',
})
@ApiTags('Admin')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminservice: AdminService) { }

    // Add Admin
    @Post('/addAdmin')
    @ApiOperation({ summary: 'Add Admin' })
    @ApiOkResponse({
        description: 'Admin added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addAdmin(@Body() adminDto: AdminDto, @Request() req) {
        const admin = await this.adminservice.addAdmin(
            adminDto,
        );
        if (admin.status == true) {
            return { status: true, message: 'Admin added successfully' };
        } else {
            throw new NotImplementedException(admin.data);
        }
    }

    // Update Admin
    @Put('/editAdmin/:admin_id')
    @ApiOperation({ summary: 'Update Admin Details' })
    @ApiOkResponse({
        description: 'Admin Details updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateCompany(
        @Request() req,
        @Param('admin_id') admin_id: string,
        @Body() adminDto: AdminDto,
    ) {
        await this.adminservice.updateAdmin(
            admin_id,
            adminDto,
            req.user,
        );
        return { status: true, message: 'Admin updated successfully', data: true };
    }

    // GET All Admins list
    @Get('/getAdminsList')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get All Admins' })
    @ApiOkResponse({
        description: 'All Admins fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getAdminsList(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const admins = await this.adminservice.getAdminsList(
            req.user,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Admins fetched successfully', data: admins };
    }

    // GET Admin by Id
    @Get('/getAdminById/:admin_id')
    @ApiOperation({ summary: 'Get Admin By Id' })
    @ApiOkResponse({
        description: 'Admin fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getAdminById(
        @Request() req,
        @Param('admin_id') admin_id: string,
    ) {
        const admin = await this.adminservice.getAdminById(
            admin_id,
            req.user,
        );
        return { status: true, message: 'Admin fetched successfully', data: admin };
    }

    // Delete Admin
    @Delete('/deleteAdmin/:admin_id')
    @ApiOperation({ summary: 'Delete Admin' })
    @ApiOkResponse({
        description: 'Admin deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteAdmin(@Request() req, @Param('admin_id') admin_id: string) {
        await this.adminservice.deleteAdmin(
            admin_id,
            req.user,
        );
        return { message: 'Admin deleted successfully', data: true };
    }

    // Restore Admin
    @Delete('/restoreAdmin/:admin_id')
    @ApiOperation({ summary: 'Restore Admin' })
    @ApiOkResponse({
        description: 'Admin restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreAdmin(
        @Request() req,
        @Param('admin_id') admin_id: string,
    ) {
        await this.adminservice.restoreAdmin(
            admin_id,
            req.user,
        );
        return { message: 'Admin restored successfully', data: true };
    }

}

