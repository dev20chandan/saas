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
    let parentsCount = 0;
    let pendingUsers = 0;
    let inactiveUsers = 0;
    let activeUsers = 0;

    // Start of the current calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (schoolId && schoolId !== 'ALL') {
      // Resolve the school object to get canonical UUID
      const schoolObj = await this.prisma.school.findFirst({
        where: { OR: [{ id: schoolId }, { code: schoolId }] },
      });
      const canonicalSchoolId = schoolObj?.id || schoolId;

      if (schoolObj) {
        if (schoolObj.status === 'Active' || schoolObj.status === 'Trial') activeSchools = 1;
        totalSchools = 1;
      }

      // Always count directly from Student table (OR on both schoolUuid and schoolId)
      studentsCount = await this.prisma.student.count({
        where: {
          OR: [
            { schoolUuid: canonicalSchoolId },
            { schoolId: canonicalSchoolId },
          ],
        },
      });

      // Always count Teachers from User table (OR on both schoolUuid and schoolId)
      teachersCount = await this.prisma.user.count({
        where: {
          role: 'Teacher',
          OR: [
            { schoolUuid: canonicalSchoolId },
            { schoolId: canonicalSchoolId },
          ],
        },
      });

      schoolAdmins = await this.prisma.admin.count({
        where: { schoolId: canonicalSchoolId, role: 'Admin' },
      });
      schoolSubAdmins = await this.prisma.admin.count({
        where: { schoolId: canonicalSchoolId, role: 'Subadmin' },
      });

      // Parents = Users with role 'Parent' + distinct student guardians
      const parentUsers = await this.prisma.user.count({
        where: {
          role: 'Parent',
          OR: [{ schoolUuid: canonicalSchoolId }, { schoolId: canonicalSchoolId }],
        },
      });
      const distinctGuardians = await this.prisma.student.findMany({
        where: {
          OR: [{ schoolUuid: canonicalSchoolId }, { schoolId: canonicalSchoolId }],
          guardianName: { not: '' },
        },
        select: { guardianName: true },
        distinct: ['guardianName'],
      });
      parentsCount = parentUsers > 0 ? parentUsers : distinctGuardians.length;

      pendingUsers = await this.prisma.user.count({
        where: {
          status: 'Pending',
          OR: [{ schoolUuid: canonicalSchoolId }, { schoolId: canonicalSchoolId }],
        },
      });
      inactiveUsers = await this.prisma.user.count({
        where: {
          status: 'Inactive',
          OR: [{ schoolUuid: canonicalSchoolId }, { schoolId: canonicalSchoolId }],
        },
      });
      activeUsers = await this.prisma.user.count({
        where: {
          status: 'Active',
          OR: [{ schoolUuid: canonicalSchoolId }, { schoolId: canonicalSchoolId }],
        },
      });
    } else {
      totalSchools = await this.prisma.school.count();
      activeSchools = await this.prisma.school.count({
        where: { status: { in: ['Active', 'Trial'] } },
      });
      schoolAdmins = await this.prisma.admin.count({ where: { role: 'Admin' } });
      const schoolSubAdmins = await this.prisma.admin.count({ where: { role: 'Subadmin' } });

      // Use actual Student table as source of truth
      studentsCount = await this.prisma.student.count();
      teachersCount = await this.prisma.user.count({ where: { role: 'Teacher' } });

      // Parents = User with role 'Parent' OR distinct student guardians
      const allParentUsers = await this.prisma.user.count({ where: { role: 'Parent' } });
      const allGuardians = await this.prisma.student.findMany({
        where: { guardianName: { not: '' } },
        select: { guardianName: true },
        distinct: ['guardianName'],
      });
      parentsCount = allParentUsers > 0 ? allParentUsers : allGuardians.length;

      pendingUsers  = await this.prisma.user.count({ where: { status: 'Pending' } });
      inactiveUsers = await this.prisma.user.count({ where: { status: 'Inactive' } });
      activeUsers   = await this.prisma.user.count({ where: { status: 'Active' } });
    }

    // ── New dynamic stats ─────────────────────────────────────────────────────
    // Use canonicalSchoolId (resolved above in the if-block)
    // For the 'ALL' case, canonicalSchoolId is undefined; no scope filter needed.
    const canonicalId = schoolId && schoolId !== 'ALL'
      ? (await this.prisma.school.findFirst({ where: { OR: [{ id: schoolId }, { code: schoolId }] } }))?.id || schoolId
      : null;

    // New admissions this month (from Student model)
    const newAdmissions = await this.prisma.student.count({
      where: {
        createdAt: { gte: startOfMonth },
        ...(canonicalId ? { OR: [{ schoolUuid: canonicalId }, { schoolId: canonicalId }] } : {}),
      },
    });

    // Active class batches
    const activeBatches = await this.prisma.class.count({
      where: canonicalId ? { schoolId: canonicalId } : {},
    });

    // Students with pending fees
    const pendingFeeStudents = await this.prisma.student.count({
      where: {
        feeStatus: 'Pending',
        ...(canonicalId ? { OR: [{ schoolUuid: canonicalId }, { schoolId: canonicalId }] } : {}),
      },
    });

    // Total admission enquiries
    const enquiryWhere: any = canonicalId ? { schoolId: canonicalId } : {};
    const totalEnquiries = await this.prisma.admissionEnquiry.count({ where: enquiryWhere });
    const enrolledEnquiries = await this.prisma.admissionEnquiry.count({
      where: { ...enquiryWhere, status: 'Enrolled' },
    });

    // ── Chart data ────────────────────────────────────────────────────────────

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
      totalParents: parentsCount,
      pendingUsers,
      inactiveUsers,
      newAdmissions,
      activeBatches,
      pendingFeeStudents,
      totalEnquiries,
      enrolledEnquiries,
      recentActivities,
      counters: {
        totalSchools,
        activeSchools,
        schoolAdmins,
        schoolSubAdmins,
        teachers: teachersCount,
        students: studentsCount,
        parents: parentsCount,
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
