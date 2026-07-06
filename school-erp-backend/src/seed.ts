import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

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

    const usersService = app.get(UsersService);

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

    console.log('🚀 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
