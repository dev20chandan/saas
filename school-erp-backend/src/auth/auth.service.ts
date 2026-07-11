import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AdminsService } from '../admins/admins.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.toLowerCase();

    // Check if it is a school user
    const user = await this.usersService.findByEmail(email);
    if (user) {
      await this.usersService.update(user.id, { password: forgotPasswordDto.password } as any);
      return { message: 'School user password updated successfully' };
    }

    // Check if it is an admin
    const admin = await this.adminsService.findByEmail(email);
    if (admin) {
      await this.adminsService.update(admin.id, { password: forgotPasswordDto.password } as any);
      return { message: 'Admin password updated successfully' };
    }

    throw new NotFoundException('No user or admin found with this email address');
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'Locked' || user.status === 'Inactive') {
      throw new UnauthorizedException('Your account is locked or inactive. Please contact support.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      type: 'user',
    };

    await this.usersService.update(user.id, { lastLogin: new Date() } as any);

    return {
      token: this.jwtService.sign(payload),
      role: user.role,
      schoolId: user.schoolId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        school: user.schoolName,
      },
    };
  }

  async adminLogin(loginDto: LoginDto) {
    const admin = await this.adminsService.findByEmail(loginDto.email);
    
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(loginDto.password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    await this.adminsService.update(admin.id, { lastLogin: new Date() } as any);

    return {
      token: this.jwtService.sign(payload),
      role: admin.role,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        settings: admin.settings,
      },
    };
  }
}
