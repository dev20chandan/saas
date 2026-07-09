import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async logActivity(type: string, text: string, color: string, schoolId = 'ALL') {
    return this.prisma.activity.create({
      data: {
        type,
        text,
        color,
        schoolId,
        time: new Date(),
      },
    });
  }

  async getRecentActivities(limit = 5, schoolId?: string) {
    const where: any = {};
    if (schoolId && schoolId !== 'ALL') {
      where.schoolId = schoolId;
    }

    return this.prisma.activity.findMany({
      where,
      orderBy: { time: 'desc' },
      take: limit,
    });
  }

  private formatChartDate(date: Date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }

  async getDashboardStats(schoolId?: string) {
    let totalSchools = 0;
    let activeSchools = 0;
    let schoolAdmins = 0;
    let schoolSubAdmins = 0;
    let studentsCount = 0;
    let teachersCount = 0;
    let pendingUsers = 0;
    let inactiveUsers = 0;
    let activeUsers = 0;

    if (schoolId && schoolId !== 'ALL') {
      const schoolObj = await this.prisma.school.findUnique({ where: { id: schoolId } });
      if (schoolObj) {
        studentsCount = schoolObj.students;
        teachersCount = schoolObj.teachers;
        if (schoolObj.status === 'Active' || schoolObj.status === 'Trial') {
          activeSchools = 1;
        }
        totalSchools = 1;
      }

      schoolAdmins = await this.prisma.admin.count({
        where: { schoolId, role: 'Admin' },
      });
      schoolSubAdmins = await this.prisma.admin.count({
        where: { schoolId, role: 'Subadmin' },
      });
      const dbTeachers = await this.prisma.user.count({
        where: { schoolId, role: 'Teacher' },
      });
      teachersCount = Math.max(teachersCount, dbTeachers);
      pendingUsers = await this.prisma.user.count({
        where: { schoolId, status: 'Pending' },
      });
      inactiveUsers = await this.prisma.user.count({
        where: { schoolId, status: 'Inactive' },
      });
      activeUsers = await this.prisma.user.count({
        where: { schoolId, status: 'Active' },
      });
    } else {
      totalSchools = await this.prisma.school.count();
      activeSchools = await this.prisma.school.count({
        where: { status: { in: ['Active', 'Trial'] } },
      });
      schoolAdmins = await this.prisma.admin.count({ where: { role: 'Admin' } });
      const schoolSubAdmins = await this.prisma.admin.count({ where: { role: 'Subadmin' } });

      const schoolAggregations = await this.prisma.school.aggregate({
        _sum: {
          students: true,
          teachers: true,
        },
      });

      studentsCount = schoolAggregations._sum.students ?? 0;
      teachersCount = (schoolAggregations._sum.teachers ?? 0) +
        (await this.prisma.user.count({ where: { role: 'Teacher' } }));

      pendingUsers = await this.prisma.user.count({ where: { status: 'Pending' } });
      inactiveUsers = await this.prisma.user.count({ where: { status: 'Inactive' } });
      activeUsers = await this.prisma.user.count({ where: { status: 'Active' } });
    }

    const schoolGrowthChart: Array<{ date: string; count: number }> = [];
    if (!schoolId || schoolId === 'ALL') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const schools = await this.prisma.school.findMany({
        where: { createdAt: { gte: oneWeekAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const growthByDay = new Map<string, number>();
      schools.forEach((school) => {
        const label = this.formatChartDate(school.createdAt);
        growthByDay.set(label, (growthByDay.get(label) ?? 0) + 1);
      });

      for (let daysAgo = 7; daysAgo >= 0; daysAgo -= 1) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const label = this.formatChartDate(date);
        schoolGrowthChart.push({
          date: label,
          count: growthByDay.get(label) ?? 0,
        });
      }
    }

    const userAdoptionChart = [
      { date: 'Apr 27', value: 300 },
      { date: 'May 04', value: 450 },
      { date: 'May 11', value: 380 },
      { date: 'May 18', value: 520 },
      { date: 'May 26', value: activeUsers > 0 ? activeUsers : 720 },
    ];

    const recentActivities = await this.getRecentActivities(5, schoolId);

    return {
      totalSchools,
      activeSchools,
      totalStudents: studentsCount,
      totalTeachers: teachersCount,
      pendingUsers,
      inactiveUsers,
      recentActivities,
      counters: {
        totalSchools,
        activeSchools,
        schoolAdmins,
        schoolSubAdmins,
        teachers: teachersCount,
        students: studentsCount,
        pendingUsers,
        inactiveUsers,
      },
      schoolGrowthChart: schoolId && schoolId !== 'ALL' ? undefined : schoolGrowthChart,
      userAdoptionChart,
      monthlyActiveUsers: activeUsers * 10 || 428500,
      profileCompletion: {
        current: activeUsers,
        target: 10000,
        percentage: Math.min(Math.round((activeUsers / 10000) * 100), 100),
      },
      accessHealth: 'Healthy',
    };
  }
}
