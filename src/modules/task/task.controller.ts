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
import { TaskDto } from './dto/task.dto';
import { TaskService } from './task.service';

@Controller({
    path: 'task',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Task')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class TaskController {
    constructor(private readonly taskservice: TaskService) { }

    // Add Task
    @Post('/addTask')
    @ApiOperation({ summary: 'Add Task' })
    @ApiOkResponse({
        description: 'Task added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addTask(@Body() taskDto: TaskDto, @Request() req) {
        const task = await this.taskservice.addTask(
            taskDto,
            req.user,
        );
        if (task.status == true) {
            return { message: 'Task added successfully' };
        } else {
            throw new NotImplementedException(task.data);
        }
    }

    // Update Task
    @Put('/editTask/:task_id')
    @ApiOperation({ summary: 'Update Task' })
    @ApiOkResponse({
        description: 'Task updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateTask(
        @Request() req,
        @Param('taskt_id') task_id: string,
        @Body() taskDto: TaskDto,
    ) {
        await this.taskservice.updateTask(
            task_id,
            taskDto,
            req.user,
        );
        return { message: 'Task updated successfully', data: true };
    }

    // GET All Tasks list
    @Get('/getTasks/:complaint_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Tasks' })
    @ApiOkResponse({
        description: 'Tasks fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getTasks(
        @Request() req,
        @Param('complaint_id') complaint_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const tasks = await this.taskservice.getTasks(
            req.user,
            complaint_id,
            page,
            limit,
            search,
        );
        return { message: 'Tasks fetched successfully', data: tasks };
    }

    // GET Task by Id
    @Get('/getTasktById/:task_id')
    @ApiOperation({ summary: 'Get Task By Id' })
    @ApiOkResponse({
        description: 'Task fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getTaskById(
        @Request() req,
        @Param('task_id') task_id: string,
    ) {
        const task = await this.taskservice.getTaskById(
            task_id,
            req.user,
        );
        return { message: 'Task fetched successfully', data: task };
    }

    // GET Task by Id
    @Get('/getTaskdetailsbyComplaintId/:complaint_id')
    @ApiOperation({ summary: 'Get Task By Complaint Id' })
    @ApiOkResponse({
        description: 'Task fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getTaskdetailsbyComplaintId(
        @Request() req,
        @Param('complaint_id') complaint_id: string,
    ) {
        const task = await this.taskservice.getTaskdetailsbyComplaintId(
            complaint_id,
            req.user,
        );
        return { message: 'Task fetched successfully', data: task };
    }

    // Task Completion
    @Put('/taskCompletion/:task_id')
    @ApiOperation({ summary: 'Update Task Completion' })
    @ApiOkResponse({
        description: 'Task completed successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async taskCompletion(
        @Request() req,
        @Param('taskt_id') task_id: string,
    ) {
        await this.taskservice.taskCompletion(
            task_id,
            req.user,
        );
        return { message: 'Task completed successfully', data: true };
    }

    // Delete Task
    @Delete('/deleteTask/:task_id')
    @ApiOperation({ summary: 'Delete Task' })
    @ApiOkResponse({
        description: 'Task deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteTask(@Request() req, @Param('task_id') task_id: string) {
        await this.taskservice.deleteTask(
            task_id,
            req.user,
        );
        return { message: 'Task deleted successfully', data: true };
    }

    // Restore Task
    @Delete('/restoreTask/:task_id')
    @ApiOperation({ summary: 'Restore Task' })
    @ApiOkResponse({
        description: 'Task restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreTask(
        @Request() req,
        @Param('task_id') task_id: string,
    ) {
        await this.taskservice.restoreTask(
            task_id,
            req.user,
        );
        return { message: 'Task restored successfully', data: true };
    }
}
