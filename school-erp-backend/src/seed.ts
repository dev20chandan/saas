import { NestFactory } from '@nestjs/core';
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
      prisma.user.deleteMany(),
      prisma.school.deleteMany(),
    ]);

    const usersService = app.get(UsersService);

    console.log('👤 Seeding default platform credentials...');
    await usersService.create({
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

    await usersService.create({
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

    await usersService.create({
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

    console.log('🚀 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
