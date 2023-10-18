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
import { ComplaintDto } from './dto/complaint.dto';
import { AssignComplaintDto } from './dto/assignComplaint.dto';
import { ComplaintService } from './complaint.service';

@Controller({
    path: 'complaint',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Complaint')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class ComplaintController {
    constructor(private readonly complaintservice: ComplaintService) { }

    // Add Complaint
    @Post('/addComplaint')
    @ApiOperation({ summary: 'Add Complaint' })
    @ApiOkResponse({
        description: 'Complaint added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addComplaint(@Body() complaintDto: ComplaintDto, @Request() req) {
        const complaint = await this.complaintservice.addComplaint(
            complaintDto,
            req.user,
        );
        if (complaint.status == true) {
            return { message: 'Complaint added successfully' };
        } else {
            throw new NotImplementedException(complaint.data);
        }
    }

    // Update Complaint
    @Put('/editComplaint/:complaint_id')
    @ApiOperation({ summary: 'Update Complaint' })
    @ApiOkResponse({
        description: 'Complaint updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateComplaint(
        @Request() req,
        @Param('complaint_id') complaint_id: string,
        @Body() complaintDto: ComplaintDto,
    ) {
        await this.complaintservice.updateComplaint(
            complaint_id,
            complaintDto,
            req.user,
        );
        return { message: 'Complaint updated successfully', data: true };
    }

    // GET All Complaints
    @Get('/getComplaints')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Complaints' })
    @ApiOkResponse({
        description: 'Complaints fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getComplaints(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const complaints = await this.complaintservice.getComplaints(
            req.user,
            page,
            limit,
            search,
        );
        return { message: 'Complaints fetched successfully', data: complaints };
    }

    // GET All Complaints by Item Id
    @Get('/getComplaintsByItemId/:item_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Complaints' })
    @ApiOkResponse({
        description: 'Complaints fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getComplaintsByItemId(
        @Request() req,
        @Param('item_id') item_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const complaints = await this.complaintservice.getComplaintsByItemId(
            req.user,
            item_id,
            page,
            limit,
            search,
        );
        return { message: 'Complaints fetched successfully', data: complaints };
    }

    // GET Complaint by Company Id
    @Get('/getComplaintsByCompanyId/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Complaints By Company Id' })
    @ApiOkResponse({
        description: 'Complaints fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getComplaintsByCompanyId(
        @Request() req,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const complaint = await this.complaintservice.getComplaintsByCompanyId(
            req.user,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Complaints fetched successfully', data: complaint };
    }

    // GET Complaint by Product Id
    @Get('/getComplaintsByProductId/:product_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Complaints By Product Id' })
    @ApiOkResponse({
        description: 'Complaints fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getComplaintsByProductId(
        @Request() req,
        @Param('product_id') product_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const complaint = await this.complaintservice.getComplaintsByProductId(
            req.user,
            product_id,
            page,
            limit,
            search,
        );
        return { message: 'Complaints fetched successfully', data: complaint };
    }

    // GET Complaint by Model Id
    @Get('/getComplaintsByModelId/:model_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Complaints By Model Id' })
    @ApiOkResponse({
        description: 'Complaints fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getComplaintsByModelId(
        @Request() req,
        @Param('model_id') model_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const complaint = await this.complaintservice.getComplaintsByModelId(
            req.user,
            model_id,
            page,
            limit,
            search,
        );
        return { message: 'Complaints fetched successfully', data: complaint };
    }

    // GET Complaint by Id
    @Get('/getComplaintById/:complaint_id')
    @ApiOperation({ summary: 'Get Complaint By Id' })
    @ApiOkResponse({
        description: 'Complaint fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getComplaintById(
        @Request() req,
        @Param('complaint_id') complaint_id: string,
    ) {
        const complaint = await this.complaintservice.getComplaintById(
            req.user,
            complaint_id,
        );
        return { message: 'Complaint fetched successfully', data: complaint };
    }

    // Assign Complaint
    @Put('/assignComplaint/:complaint_id')
    @ApiOperation({ summary: 'Assign Complaint' })
    @ApiOkResponse({
        description: 'Complaint assigned successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async assignComplaint(
        @Request() req,
        @Param('complaint_id') complaint_id: string,
        @Body() assigncomplaintDto: AssignComplaintDto,
    ) {
        await this.complaintservice.assignComplaint(
            complaint_id,
            assigncomplaintDto,
            req.user,
        );
        return { message: 'Complaint assigned successfully', data: true };
    }

    // Delete Complaint
    @Delete('/deleteComplaint/:complaint_id')
    @ApiOperation({ summary: 'Delete Complaint' })
    @ApiOkResponse({
        description: 'Complaint deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteComplaint(@Request() req, @Param('complaint_id') complaint_id: string) {
        await this.complaintservice.deleteComplaint(
            complaint_id,
            req.user,
        );
        return { message: 'Complaint deleted successfully', data: true };
    }

    // Restore Complaint
    @Delete('/restoreComplaint/:complaint_id')
    @ApiOperation({ summary: 'Restore Complaint' })
    @ApiOkResponse({
        description: 'Complaint restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreComplaint(
        @Request() req,
        @Param('complaint_id') complaint_id: string,
    ) {
        await this.complaintservice.restoreComplaint(
            complaint_id,
            req.user,
        );
        return { message: 'Complaint restored successfully', data: true };
    }
}








