import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';

// mongoose
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// Schemas
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role, RoleDocument } from '../role/schemas/role.schema';
import { Permission, PermissionDocument } from '../role/schemas/permission.schema';

// Dto
import { SignUpDto } from './dto/signup.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

// Enum
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';

// Services
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';

import * as bcrypt from 'bcrypt';
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private userService: UserService,
    private jwtService: JwtService,
    private autoIncrementService: AutoIncrementService,
  ) { }

  // User Signup API
  async signUp(signUpDto: SignUpDto, session: mongoose.ClientSession | null = null) {

    const existingUser = await this.userService.queryUser({
      $or: [
        { email: signUpDto.email },
        { phone_number: signUpDto.phone_number },
      ],
      status: 1,
    });
    if (existingUser) {
      if (existingUser.email === signUpDto.email) {
        throw new BadRequestException('User with this Email Id already exists');
      }
      if (existingUser.phone_number === signUpDto.phone_number) {
        throw new BadRequestException(
          'User with this Phone number already exists',
        );
      }
    }
    // Create User Id
    const user_id = await this.autoIncrementService.getNextSequence(
      AutoIncrementEnum.USER,
      session,
    );
    // Create User Schema
    const user = new User();
    user.user_id = user_id;
    user.email = signUpDto.email;
    user.phone_number = signUpDto.phone_number;
    user.role_id = signUpDto.role_id;
    user.user_type = signUpDto.user_type;
    user.password = await AppUtils.getEncryptedPassword(
      signUpDto.password ? signUpDto.password : signUpDto.phone_number,
    );
    user.is2FaEnabled = false,
    user.otp = '',
    user.otpExpiry = '',
    user.last_login_date = '',
    user.created_at = AppUtils.getIsoUtcMoment();
    user.updated_at = AppUtils.getIsoUtcMoment();
    user.created_by = user_id;
    user.updated_by = user_id;

    try {
      // Create User in the Db
      const usercreate = await this.userModel.create([user], { session });
      return { status: true, user_id: user_id, message: usercreate[0].status };
    } catch (e) {
      return { status: false, user_id: user_id, message: e };
    }
  }

  // User Login API
  async login(user: User) {
    const {
      user_id,
      email,
      phone_number,
      role_id,
      user_type,
      is2FaEnabled,
    } = user;
    const login_date = AppUtils.getIsoUtcMoment();
    await this.userModel.updateOne(
      { user_id: user_id },
      { last_login_date: login_date },
    );

    // GET User Role
    const userrole = await this.roleModel.findOne({ role_id: role_id, status: 1 }).exec();

    const role = userrole.role;

    // GET Permissions
    const permissions = await this.permissionModel.aggregate([
      {
        $match: { role_id: role_id, status: 1 },
      },
      {
        $project: {
          permissions: '$module_permissions',
        }
      }
    ])

    return {
      access_token: this.jwtService.sign({
        sub: user_id,
        user_id,
        email,
        phone_number,
        user_type,
        role,
      }),
      email,
      is2FaEnabled,
      phone_number,
      user_type,
      permissions,
    };
  }

  async addRoletoUser(user_id: string, role_id: string, session: mongoose.ClientSession | null = null) {
    return this.userModel.updateOne([{user_id}, {role_id: role_id}], { session }).exec();
  }

  async sendOtp(user: User) {
    return this.userService.sendOtp(user.user_id);
  }

  async verifyOtp(user: User, otp: string) {
    return this.userService.verifyOtp(user.user_id, otp);
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(
      user.user_id,
      changePasswordDto.password,
    );
  }

  async validateUser(username: string, password: string) {
    const findUser = await this.userService.queryUser({ email: username });
    if (!findUser) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const isValid = await bcrypt.compare(password, findUser.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return findUser;
  }

  async userrollback(rollbackpoint: string) {
    if (rollbackpoint == 'user') {
      // Rollback User Id
      await this.autoIncrementService.getprevious(AutoIncrementEnum.USER);
      return;
    } else {
      return;
    }
  }

}
