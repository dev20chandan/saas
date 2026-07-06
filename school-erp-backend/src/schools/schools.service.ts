import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School, SchoolDocument } from './schemas/school.schema';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
  ) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    const code = createSchoolDto.code || `SCH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSchool = new this.schoolModel({
      ...createSchoolDto,
      code,
      status: createSchoolDto.status || 'Trial',
    });
    return newSchool.save();
  }

  async findAll(query: {
    search?: string;
    status?: string;
    plan?: string;
    page?: number;
    limit?: number;
  }): Promise<{ schools: School[]; total: number }> {
    const { search, status, plan, page = 1, limit = 8 } = query;
    const filter: any = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (plan && plan !== 'All') {
      filter.plan = plan;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { city: searchRegex },
        { email: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [schools, total] = await Promise.all([
      this.schoolModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.schoolModel.countDocuments(filter).exec(),
    ]);

    return { schools, total };
  }

  async findOne(id: string): Promise<School> {
    const school = await this.schoolModel.findById(id).exec();
    if (!school) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }
    return school;
  }

  async findByCode(code: string): Promise<School | null> {
    return this.schoolModel.findOne({ code }).exec();
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    const updated = await this.schoolModel
      .findByIdAndUpdate(id, updateSchoolDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<School> {
    const deleted = await this.schoolModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`School with ID "${id}" not found`);
    }
    return deleted;
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    trial: number;
    expired: number;
    suspended: number;
  }> {
    const statsArray = await this.schoolModel.aggregate([
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
      trial: 0,
      expired: 0,
      suspended: 0,
    };

    statsArray.forEach((item) => {
      const status = item._id ? item._id.toLowerCase() : '';
      if (status === 'active') stats.active = item.count;
      else if (status === 'trial') stats.trial = item.count;
      else if (status === 'expired') stats.expired = item.count;
      else if (status === 'suspended') stats.suspended = item.count;
    });

    stats.total = await this.schoolModel.countDocuments().exec();

    return stats;
  }

  async getSchoolsGrowth(): Promise<any[]> {
    // Return last 12 months school registrations aggregation or static chart representation.
    // For dashboard compliance, let's group schools created in the last 30 days by date.
    // We can fetch recent dates.
    const rawData = await this.schoolModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 }
    ]).exec();
    return rawData;
  }
}
