import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersService } from './users/users.service';

const DEFAULT_PASSWORD = 'School@123';

async function bootstrap() {
  console.log('🌱 Starting DB Seeding...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const prisma = app.get(PrismaService);

    console.log('🧹 Clearing existing database tables...');
    await prisma.$transaction([
      prisma.ticket.deleteMany(),
      prisma.activity.deleteMany(),
      prisma.auditLog.deleteMany(),
      prisma.admin.deleteMany(),
      prisma.user.deleteMany(),
      prisma.school.deleteMany(),
    ]);

    console.log('👤 Seeding default platform credentials...');

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    await prisma.admin.create({
      data: {
        name: 'Owner',
        email: 'owner@schoolsaas.in',
        password: passwordHash,
        role: 'owner',
        schoolId: 'ALL',
        schoolName: 'All Schools',
        operator: 'System',
        status: 'Active',
        phone: '+91 98765 00001',
      }
    });

    await prisma.admin.create({
      data: {
        name: 'Admin User',
        email: 'admin@schoolsaas.in',
        password: passwordHash,
        role: 'Admin',
        schoolId: 'ALL',
        schoolName: 'All Schools',
        operator: 'Owner',
        status: 'Active',
        phone: '+91 98765 00002',
      }
    });

    await prisma.admin.create({
      data: {
        name: 'SubAdmin User',
        email: 'subadmin@schoolsaas.in',
        password: passwordHash,
        role: 'Sub Admin',
        schoolId: 'ALL',
        schoolName: 'All Schools',
        operator: 'Admin User',
        status: 'Active',
        phone: '+91 98765 00003',
      }
    });

    // Optional: Seed a fake School User to demonstrate the User table
    const usersService = app.get(UsersService);
    await usersService.create({
      name: 'Teacher User',
      email: 'teacher@schoolsaas.in',
      password: DEFAULT_PASSWORD,
      role: 'Teacher',
      schoolId: 'SCH-001',
      school: 'Demo School',
      operator: 'Admin User',
      status: 'Active',
      phone: '+91 98765 00004',
    });

    console.log('🚀 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
