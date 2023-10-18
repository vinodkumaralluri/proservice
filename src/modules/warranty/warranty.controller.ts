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
import { ClaimStatus } from 'src/enums/claim-status.enum';
import { TransformInterceptor } from '../../core/transform.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClaimDto } from './dto/claim.dto';
import { WarrantyDto } from './dto/warranty.dto';
import { WarrantyService } from './warranty.service';

@Controller({
    path: 'warranty',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Warranty')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class WarrantyController {
    constructor(private readonly warrantyservice: WarrantyService) { }

    // Add Warranty
    @Post('/addWarranty')
    @ApiOperation({ summary: 'Add Warranty' })
    @ApiOkResponse({
        description: 'Warranty added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addWarranty(@Body() warrantyDto: WarrantyDto, @Request() req) {
        const warranty = await this.warrantyservice.addWarranty(
            warrantyDto,
            req.user,
        );
        if (warranty.status == true) {
            return { message: 'Warranty added successfully' };
        } else {
            throw new NotImplementedException(warranty.data);
        }
    }

    // Update Warranty
    @Put('/editWarranty/:warranty_id')
    @ApiOperation({ summary: 'Update Warranty' })
    @ApiOkResponse({
        description: 'Warranty updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateWarranty(
        @Request() req,
        @Param('warranty_id') warranty_id: string,
        @Body() warrantDto: WarrantyDto,
    ) {
        await this.warrantyservice.updateWarranty(
            warranty_id,
            warrantDto,
            req.user,
        );
        return { message: 'Warranty updated successfully', data: true };
    }

    // GET All Warranty by Item
    @Get('/getWarranties')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Warranty by Item' })
    @ApiOkResponse({
        description: 'Warranty fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getWarranty(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const warranty = await this.warrantyservice.getWarranty(
            req.user,
            page,
            limit,
            search,
        );
        return { message: 'Warranty fetched successfully', data: warranty };
    }

    // GET Warranty by Id
    @Get('/getWarrantyById/:warranty_id')
    @ApiOperation({ summary: 'Get Warranty By Id' })
    @ApiOkResponse({
        description: 'Warranty fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getWarrantyById(
        @Request() req,
        @Param('warranty_id') warranty_id: string,
    ) {
        const warranty = await this.warrantyservice.getWarrantyById(
            warranty_id,
            req.user,
        );
        return { message: 'Warranty fetched successfully', data: warranty };
    }

    // GET Warranty by Item Id
    @Get('/getWarrantyByItemId/:item_id')
    @ApiOperation({ summary: 'Get Warranty By Id' })
    @ApiOkResponse({
        description: 'Warranty fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getWarrantyByItemId(
        @Request() req,
        @Param('item_id') item_id: string,
    ) {
        const warranty = await this.warrantyservice.getWarrantyByItemId(
            item_id,
            req.user,
        );
        return { message: 'Warranty fetched successfully', data: warranty };
    }

    // GET Warranty by Model Id
    @Get('/getWarrantyByModelId/:model_id')
    @ApiOperation({ summary: 'Get Warranty By Model Id' })
    @ApiOkResponse({
        description: 'Warranty fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getWarrantyByModelId(
        @Request() req,
        @Param('model_id') model_id: string,
    ) {
        const warranty = await this.warrantyservice.getWarrantyByModelId(
            model_id,
            req.user,
        );
        return { message: 'Warranty fetched successfully', data: warranty };
    }

    // Delete Warranty
    @Delete('/deleteWarranty/:warranty_id')
    @ApiOperation({ summary: 'Delete Warranty' })
    @ApiOkResponse({
        description: 'Warranty deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteWarranty(@Request() req, @Param('warranty_id') warranty_id: string) {
        await this.warrantyservice.deleteWarranty(
            warranty_id,
            req.user,
        );
        return { message: 'Warranty deleted successfully', data: true };
    }

    // Restore Warranty
    @Delete('/restoreWarranty/:warranty_id')
    @ApiOperation({ summary: 'Restore Warranty' })
    @ApiOkResponse({
        description: 'Warranty restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreWarranty(
        @Request() req,
        @Param('warranty_id') warranty_id: string,
    ) {
        await this.warrantyservice.restoreWarranty(
            warranty_id,
            req.user,
        );
        return { message: 'Warranty restored successfully', data: true };
    }

    // Add Claim
    @Post('/addClaim')
    @ApiOperation({ summary: 'Add Claim' })
    @ApiOkResponse({
        description: 'Claim added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addClaim(@Body() claimDto: ClaimDto, @Request() req) {
        const claim = await this.warrantyservice.addClaim(
            claimDto,
            req.user,
        );
        if (claim.status == true) {
            return { message: 'Claim added successfully' };
        } else {
            throw new NotImplementedException(claim.data);
        }
    }

    // Update Claim
    @Put('/editClaim/:claim_id')
    @ApiOperation({ summary: 'Update Claim' })
    @ApiOkResponse({
        description: 'Claim updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateClaim(
        @Request() req,
        @Param('claim_id') claim_id: string,
        @Body() claimDto: ClaimDto,
    ) {
        await this.warrantyservice.updateClaim(
            claim_id,
            claimDto,
            req.user,
        );
        return { message: 'Claim updated successfully', data: true };
    }

    // GET All Claims by Item
    @Get('/getClaimsByItemId/:item_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Claims by Item' })
    @ApiOkResponse({
        description: 'Claims fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getClaimsByItemId(
        @Request() req,
        @Param('item_id') item_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const claim = await this.warrantyservice.getClaimsByItemId(
            req.user,
            item_id,
            page,
            limit,
            search,
        );
        return { message: 'Claims fetched successfully', data: claim };
    }

    // GET All Claims by Complaint Id
    @Get('/getClaimByComplaintId/:complaint_id')
    @ApiOperation({ summary: 'Get Claims by Complaint' })
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
    async getClaimByComplaintId(
        @Request() req,
        @Param('complaint_id') complaint_id: string,
    ) {
        const claim = await this.warrantyservice.getClaimByComplaintId(            
            complaint_id,
            req.user,
        );
        return { message: 'Claims fetched successfully', data: claim };
    }

    // GET All Claims by Warranty
    @Get('/getClaimsByWarrantyId/:warranty_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Claims by Warranty' })
    @ApiOkResponse({
        description: 'Claims fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getClaimsByWarrantyId(
        @Request() req,
        @Param('warranty_id') warranty_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const claim = await this.warrantyservice.getClaimsByWarrantyId(
            req.user,
            warranty_id,
            page,
            limit,
            search,
        );
        return { message: 'Claims fetched successfully', data: claim };
    }

    // GET Claim by Id
    @Get('/getClaimById/:claim_id')
    @ApiOperation({ summary: 'Get Claim By Id' })
    @ApiOkResponse({
        description: 'Claim fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getClaimById(
        @Request() req,
        @Param('claim_id') claim_id: string,
    ) {
        const claim = await this.warrantyservice.getClaimById(
            claim_id,
            req.user,
        );
        return { message: 'Claim fetched successfully', data: claim };
    }

    // Update Claim Status
    @Put('/updateClaimStatus/:claim_id')
    @ApiOperation({ summary: 'Update Claim Status' })
    @ApiOkResponse({
        description: 'Claim Status updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateClaimStatus(
        @Request() req,
        @Body('claim_status') claim_status: ClaimStatus,
        @Param('claim_id') claim_id: string,
    ) {
        await this.warrantyservice.updateClaimStatus(
            claim_status,
            claim_id,
            req.user,
        );
        return { message: 'Claim Status updated successfully', data: true };
    }

    // Delete Claim
    @Delete('/deleteClaim/:claim_id')
    @ApiOperation({ summary: 'Delete Claim' })
    @ApiOkResponse({
        description: 'Claim deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteClaim(@Request() req, @Param('claim_id') claim_id: string) {
        await this.warrantyservice.deleteClaim(
            claim_id,
            req.user,
        );
        return { message: 'Claim deleted successfully', data: true };
    }

    // Restore Claim
    @Delete('/restoreClaim/:claim_id')
    @ApiOperation({ summary: 'Restore Claim' })
    @ApiOkResponse({
        description: 'Claim restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreClaim(
        @Request() req,
        @Param('claim_id') claim_id: string,
    ) {
        await this.warrantyservice.restoreClaim(
            claim_id,
            req.user,
        );
        return { message: 'Claim restored successfully', data: true };
    }
}

