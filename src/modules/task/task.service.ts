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
import { Task, TaskDocument } from './schemas/task.schema';
import { Complaint, ComplaintDocument } from '../complaint/schemas/complaint.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { TaskDto } from './dto/task.dto';
import { User } from '../users/schemas/user.schema';
import { TaskStatus } from 'src/enums/task-status.enum';

@Injectable()
export class TaskService {
    constructor(
        @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
        @InjectModel(Complaint.name) private complaintModel: Model<ComplaintDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Task
    async queryTask(filter: any) {
        const task = await this.taskModel.findOne(filter).exec();
        return task;
    }

    // Add Task
    async addTask(taskDto: TaskDto, loggedInUser: User) {

        // Check for Task
        const taskcheck = await this.taskModel
            .findOne({ task: taskDto.task, status: 1 })
            .exec();
        if (taskcheck) {
            throw new BadRequestException('Task already exists');
        }
        // Create Task Id
        const task_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.TASK,
        );
        const task = new Task();
        task.task_id = task_id;
        task.complaint_id = taskDto.complaint_id;
        task.task = taskDto.task;
        task.assigned_to = taskDto.assigned_to;
        task.assigned_date = taskDto.assigned_date;
        task.assigned_time = taskDto.assigned_time;
        task.created_at = AppUtils.getIsoUtcMoment();
        task.updated_at = AppUtils.getIsoUtcMoment();
        task.created_by = loggedInUser.user_id;
        task.updated_by = loggedInUser.user_id;
        try {
            await this.taskModel.create(task);
            await this.complaintModel.updateOne({ complaint_id: taskDto.complaint_id }, { $inc: { tasks_assigned: 1, tasks_pending: 1 }, complaint_status: TaskStatus.InProgress });
            return { status: true, data: 'success' };
        } catch (e) {
            await this.autoIncrementService.getprevious(AutoIncrementEnum.TASK);
            return { status: false, data: e };
        }
    }

    // GET All Tasks list
    async getTasks(
        loggedInUser: User,
        complaint_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { complaint_id: complaint_id, status: 1 };
        if (search) {
            params.task = { $regex: search };
        }
        const count = await this.taskModel.count(params).exec();
        const list = await this.taskModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Task by Id
    async getTaskById(id: string, loggedInUser: User) {
        const task = await this.taskModel
            .findOne({ task_id: id })
            .exec();
        return task;
    }

    // GET Task details by Complaint Id
    async getTaskdetailsbyComplaintId(complaint_id: string, loggedInUser: User) {
        const task = await this.complaintModel.aggregate([
            { $match: { complaint_id: complaint_id, status: 1 } },
            {
                $lookup: {
                    from: 'items',
                    localField: 'item_id',
                    foreignField: 'item_id',
                    as: 'items_doc',
                },
            },
            { $unwind: '$items_doc' },
            {
                $lookup: {
                    from: 'models',
                    localField: 'items_doc.model_id',
                    foreignField: 'model_id',
                    as: 'models_doc',
                },
            },
            { $unwind: '$models_doc' },
            {
                $project: {
                    complaint_id: '$complaint_id',
                    item_id: '$item_id',
                    model_id: '$items_doc.model_id',
                    product_id: '$models_doc.product_id',
                    company_id: '$models_doc.company_id',
                },
            },            
        ]).exec();
        return task;
    }

    // Update Task by Id
    async updateTask(
        task_id: string,
        taskDto: TaskDto,
        loggedInUser: User,
    ) {
        const task = await this.taskModel.findOne({ task_id }).exec();
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        task.task = taskDto.task;
        task.assigned_to = taskDto.assigned_to;
        task.assigned_date = taskDto.assigned_date;
        task.assigned_time = taskDto.assigned_time;
        task.updated_at = AppUtils.getIsoUtcMoment();
        task.updated_by = loggedInUser.user_id;
        return this.taskModel.updateOne({ task_id }, task);
    }

    //  Task Completion
    async taskCompletion(
        task_id: string,
        loggedInUser: User,
    ) {
        const task = await this.taskModel.findOne({ task_id }).exec();
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        await this.taskModel.updateOne(
            { task_id },
            {
                task_status: TaskStatus.Completed,
                updated_at: AppUtils.getIsoUtcMoment(),
                updated_by: loggedInUser.user_id,
            },
        );
        const complaint = await this.complaintModel.findByIdAndUpdate({complaint_id: task.complaint_id}, {$inc: {tasks_completed: 1, tasks_pending: -1}})
        if(complaint.tasks_pending === 0) {
            await this.complaintModel.updateOne({complaint_id: task.complaint_id}, {complaint_status: TaskStatus.Completed})
        }
        return;
    }

    // Delete Task by Id
    async deleteTask(task_id: string, loggedInUser: User) {
        const task = await this.taskModel.findOne({ task_id }).exec();
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        await this.taskModel.updateOne({ task_id }, { status: 0 });
        return;
    }

    // Restore Task by Id
    async restoreTask(task_id: string, loggedInUser: User) {
        const task = await this.taskModel.findOne({ task_id }).exec();
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        await this.taskModel.updateOne({ task_id }, { status: 1 });
        return;
    }

}







