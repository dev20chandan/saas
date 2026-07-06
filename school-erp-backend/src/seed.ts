import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SchoolsService } from './schools/schools.service';
import { UsersService } from './users/users.service';
import { StatsService } from './stats/stats.service';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

const MOCK_SCHOOLS = [
  { name: 'Greenfield International School', code: 'GIS-001', type: 'CBSE', city: 'New Delhi', state: 'Delhi', plan: 'Premium', status: 'Active', students: 2840, teachers: 142, email: 'admin@greenfield.edu.in', phone: '+91 98765 43210', operator: 'Platform Owner' },
  { name: 'Sunrise Public School', code: 'SPS-002', type: 'ICSE', city: 'Mumbai', state: 'Maharashtra', plan: 'Standard', status: 'Trial', students: 1200, teachers: 68, email: 'info@sunrisepublic.edu.in', phone: '+91 87654 32109', operator: 'Platform Owner' },
  { name: 'City Montessori School', code: 'CMS-003', type: 'CBSE', city: 'Lucknow', state: 'Uttar Pradesh', plan: 'Enterprise', status: 'Active', students: 6200, teachers: 310, email: 'contact@cms.edu.in', phone: '+91 76543 21098', operator: 'Platform Owner' },
  { name: 'Bright Future Academy', code: 'BFA-004', type: 'State Board', city: 'Chennai', state: 'Tamil Nadu', plan: 'Basic', status: 'Trial', students: 480, teachers: 28, email: 'admin@brightfuture.edu.in', phone: '+91 65432 10987', operator: 'Platform Owner' },
  { name: 'Delhi Public School', code: 'DPS-005', type: 'CBSE', city: 'Bangalore', state: 'Karnataka', plan: 'Premium', status: 'Active', students: 3400, teachers: 175, email: 'dps@bangalore.edu.in', phone: '+91 54321 09876', operator: 'Platform Owner' },
  { name: 'Ryan International School', code: 'RIS-006', type: 'CBSE', city: 'Pune', state: 'Maharashtra', plan: 'Standard', status: 'Expired', students: 1850, teachers: 92, email: 'ryan@pune.edu.in', phone: '+91 43210 98765', operator: 'Platform Owner' },
  { name: 'The Heritage School', code: 'THS-007', type: 'IB', city: 'Kolkata', state: 'West Bengal', plan: 'Enterprise', status: 'Active', students: 2100, teachers: 108, email: 'info@heritageschool.edu.in', phone: '+91 32109 87654', operator: 'Platform Owner' },
  { name: 'Presidium School', code: 'PRE-008', type: 'CBSE', city: 'Gurgaon', state: 'Haryana', plan: 'Premium', status: 'Active', students: 1600, teachers: 84, email: 'presidium@gurgaon.edu.in', phone: '+91 21098 76543', operator: 'Platform Owner' },
  { name: 'Kendriya Vidyalaya No. 1', code: 'KV-009', type: 'CBSE', city: 'Hyderabad', state: 'Telangana', plan: 'Basic', status: 'Active', students: 900, teachers: 52, email: 'kv1@hyderabad.edu.in', phone: '+91 10987 65432', operator: 'Platform Owner' },
  { name: 'La Martiniere College', code: 'LMC-010', type: 'ICSE', city: 'Lucknow', state: 'Uttar Pradesh', plan: 'Standard', status: 'Suspended', students: 1400, teachers: 76, email: 'lmc@lucknow.edu.in', phone: '+91 09876 54321', operator: 'Platform Owner' },
];

const DEFAULT_PASSWORD = 'School@123';

async function bootstrap() {
  console.log('🌱 Starting DB Seeding...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const connection = app.get<Connection>(getConnectionToken());
    
    // Clear old tables
    console.log('🧹 Clearing existing database collections...');
    const collections = Object.keys(connection.collections);
    for (const collectionName of collections) {
      await connection.collections[collectionName].deleteMany({});
    }

    const schoolsService = app.get(SchoolsService);
    const usersService = app.get(UsersService);
    const statsService = app.get(StatsService);

    // 1. Seed Core Admins
    console.log('👤 Seeding default platform credentials...');
    const superAdmin = await usersService.create({
      name: 'Owner',
      email: 'owner@schoolsaas.in',
      password: DEFAULT_PASSWORD,
      role: 'System Admin',
      schoolId: 'ALL',
      school: 'All Schools',
      operator: 'System',
      status: 'Active',
      phone: '+91 98765 00001',
    });

    const admin = await usersService.create({
      name: 'Admin User',
      email: 'admin@schoolsaas.in',
      password: DEFAULT_PASSWORD,
      role: 'School Admin',
      schoolId: 'ALL',
      school: 'All Schools',
      operator: 'Owner',
      status: 'Active',
      phone: '+91 98765 00002',
    });

    const subAdmin = await usersService.create({
      name: 'SubAdmin User',
      email: 'subadmin@schoolsaas.in',
      password: DEFAULT_PASSWORD,
      role: 'Staff',
      schoolId: 'ALL',
      school: 'All Schools',
      operator: 'Admin User',
      status: 'Active',
      phone: '+91 98765 00003',
    });

    // 2. Seed Schools
    console.log('🏫 Seeding schools...');
    const schoolMap: Record<string, string> = {};
    for (const sch of MOCK_SCHOOLS) {
      const createdSchool = await schoolsService.create({
        name: sch.name,
        code: sch.code,
        type: sch.type,
        city: sch.city,
        state: sch.state,
        plan: sch.plan,
        status: sch.status,
        students: sch.students,
        teachers: sch.teachers,
        email: sch.email,
        phone: sch.phone,
        principal: 'Mr. Principal',
        operator: sch.operator,
      });
      schoolMap[sch.code] = (createdSchool as any)._id.toString();
    }

    // 3. Seed Users linked to specific Schools
    console.log('👥 Seeding school admins, teachers, and staff...');
    const usersToSeed = [
      { name: 'Priya Sharma', email: 'priya.s@greenfield.edu.in', role: 'School Admin', schoolCode: 'GIS-001', status: 'Active', phone: '+91 98765 00100' },
      { name: 'Rahul Verma', email: 'rahul.v@sunrisepublic.edu.in', role: 'Teacher', schoolCode: 'SPS-002', status: 'Active', phone: '+91 98765 00200' },
      { name: 'Sneha Patel', email: 'sneha.p@cms.edu.in', role: 'Teacher', schoolCode: 'CMS-003', status: 'Pending', phone: '+91 98765 00300' },
      { name: 'Amit Kumar', email: 'amit.k@brightfuture.edu.in', role: 'Staff', schoolCode: 'BFA-004', status: 'Locked', phone: '+91 98765 00400' },
      { name: 'Neha Gupta', email: 'neha.g@dps.edu.in', role: 'School Admin', schoolCode: 'DPS-005', status: 'Active', phone: '+91 98765 00500' },
      { name: 'Vikas Singh', email: 'vikas.s@ryan.edu.in', role: 'Teacher', schoolCode: 'RIS-006', status: 'Inactive', phone: '+91 98765 00600' },
      { name: 'Anjali Desai', email: 'anjali.d@heritageschool.edu.in', role: 'Staff', schoolCode: 'THS-007', status: 'Active', phone: '+91 98765 00700' },
      { name: 'Sanjay Reddy', email: 'sanjay.r@presidium.edu.in', role: 'Parent', schoolCode: 'PRE-008', status: 'Active', phone: '+91 98765 00800' },
      { name: 'Pooja Iyer', email: 'pooja.i@kv1.edu.in', role: 'Teacher', schoolCode: 'KV-009', status: 'Active', phone: '+91 98765 00900' },
      { name: 'Ravi Teja', email: 'ravi.t@lmc.edu.in', role: 'School Admin', schoolCode: 'LMC-010', status: 'Locked', phone: '+91 98765 01000' },
    ];

    for (const u of usersToSeed) {
      const sId = schoolMap[u.schoolCode];
      await usersService.create({
        name: u.name,
        email: u.email,
        password: DEFAULT_PASSWORD,
        role: u.role,
        schoolId: sId,
        operator: 'Owner',
        status: u.status,
        phone: u.phone,
      });
    }

    // 4. Seed Activities
    console.log('📋 Seeding activities...');
    await statsService.logActivity('school', 'New school Greenfield International School registered', 'bg-blue-100 text-blue-600');
    await statsService.logActivity('user', 'School admin Priya Sharma added for Greenfield International School', 'bg-green-100 text-green-600');
    await statsService.logActivity('user', 'Teacher Rahul Verma onboarded to Sunrise Public School', 'bg-orange-100 text-orange-500');
    await statsService.logActivity('user', 'Parent account linked in City Montessori School', 'bg-purple-100 text-purple-600');
    await statsService.logActivity('support', 'Support ticket for school login resolved', 'bg-red-100 text-red-500');

    console.log('🚀 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
