import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { School, SchoolDocument } from '../schools/schemas/school.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existing = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    let schoolName = createUserDto.school || 'All Schools';
    const schoolId = createUserDto.schoolId || 'ALL';

    if (schoolId !== 'ALL' && !createUserDto.school) {
      const school = await this.schoolModel.findById(schoolId).exec();
      if (school) {
        schoolName = school.name;
      }
    }

    const newUser = new this.userModel({
      ...createUserDto,
      password: passwordHash,
      schoolId,
      school: schoolName,
      status: createUserDto.status || 'Active',
    });

    return newUser.save();
  }

  async findAll(query: {
    search?: string;
    role?: string;
    status?: string;
    schoolId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }> {
    const { search, role, status, schoolId, page = 1, limit = 8 } = query;
    const filter: any = {};

    if (schoolId && schoolId !== 'ALL') {
      filter.schoolId = schoolId;
    }

    if (role && role !== 'All') {
      filter.role = role;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { school: searchRegex },
        { phone: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return { users, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updateData: any = { ...updateUserDto };

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    if (updateUserDto.schoolId && updateUserDto.schoolId !== 'ALL' && !updateUserDto.school) {
      const school = await this.schoolModel.findById(updateUserDto.schoolId).exec();
      if (school) {
        updateData.school = school.name;
      }
    }

    const updated = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<User> {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return deleted;
  }

  async getStats(schoolId?: string): Promise<{
    total: number;
    active: number;
    pending: number;
    locked: number;
    inactive: number;
  }> {
    const matchFilter: any = {};
    if (schoolId && schoolId !== 'ALL') {
      matchFilter.schoolId = schoolId;
    }

    const statsArray = await this.userModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]).exec();

    const stats = {
      total: 0,
      active: 0,
      pending: 0,
      locked: 0,
      inactive: 0,
    };

    statsArray.forEach((item) => {
      const status = item._id ? item._id.toLowerCase() : '';
      if (status === 'active') stats.active = item.count;
      else if (status === 'pending') stats.pending = item.count;
      else if (status === 'locked') stats.locked = item.count;
      else if (status === 'inactive') stats.inactive = item.count;
    });

    stats.total = await this.userModel.countDocuments(matchFilter).exec();

    return stats;
  }
}
