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
import { CustomerDto } from './dto/customer.dto';
import { CustomerService } from './customer.service';

@Controller({
    path: 'customer',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Customer')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class CustomerController {
    constructor(private readonly customerservice: CustomerService) { }

    // Add Customer
    @Post('/addCustomer')
    @ApiOperation({ summary: 'Add Customer' })
    @ApiOkResponse({
        description: 'Customer added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addCustomer(@Body() customerDto: CustomerDto, @Request() req) {
        const customer = await this.customerservice.addCustomer(
            customerDto,
            req.user,
        );
        if (customer.status == true) {
            return { message: 'Customer added successfully' };
        } else {
            throw new NotImplementedException(customer.data);
        }
    }

    // Update Customer
    @Put('/editCustomer/:customer_id')
    @ApiOperation({ summary: 'Update Customer' })
    @ApiOkResponse({
        description: 'Customer updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateCustomer(
        @Request() req,
        @Param('customer_id') customer_id: string,
        @Body() customerDto: CustomerDto,
    ) {
        await this.customerservice.updateCustomer(
            customer_id,
            customerDto,
            req.user,
        );
        return { message: 'Customer updated successfully', data: true };
    }

    // GET All Customers list
    @Get('/getCustomers')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Customers' })
    @ApiOkResponse({
        description: 'Customers fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getCustomers(
        @Request() req,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const customers = await this.customerservice.getCustomers(
            req.user,
            page,
            limit,
            search,
        );
        return { message: 'Customers fetched successfully', data: customers };
    }

    // GET Customer by Id
    @Get('/getCustomerById/:customer_id')
    @ApiOperation({ summary: 'Get Customer By Id' })
    @ApiOkResponse({
        description: 'Customer fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getCustomerById(
        @Request() req,
        @Param('customer_id') customer_id: string,
    ) {
        const customer = await this.customerservice.getCustomerById(
            customer_id,
            req.user,
        );
        return { message: 'Customer fetched successfully', data: customer };
    }

    // Add Location of the Customer
    @Put('/addLocationToCustomer/:location_id/:customer_id')
    @ApiOperation({ summary: 'Add Location of the Customer' })
    @ApiOkResponse({
        description: 'Location added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addLocationToCustomer(
        @Request() req,
        @Param('location_id') location_id: string,
        @Param('customer_id') customer_id: string,
    ) {
        await this.customerservice.addLocationToCustomer(
            location_id,
            customer_id,
        );
        return { message: 'Location added successfully', data: true };
    }

    // Delete Customer
    @Delete('/deleteCustomer/:customer_id')
    @ApiOperation({ summary: 'Delete Customer' })
    @ApiOkResponse({
        description: 'Customer deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteCustomer(@Request() req, @Param('customer_id') customer_id: string) {
        await this.customerservice.deleteCustomer(
            customer_id,
            req.user,
        );
        return { message: 'Customer deleted successfully', data: true };
    }

    // Restore Customer
    @Delete('/restoreCustomer/:customer_id')
    @ApiOperation({ summary: 'Restore Customer' })
    @ApiOkResponse({
        description: 'Customer restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreCustomer(
        @Request() req,
        @Param('customer_id') customer_id: string,
    ) {
        await this.customerservice.restoreCustomer(
            customer_id,
            req.user,
        );
        return { message: 'Customer restored successfully', data: true };
    }
}

