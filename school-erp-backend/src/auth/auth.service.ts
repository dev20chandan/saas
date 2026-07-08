import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AdminsService } from '../admins/admins.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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

  async login(loginDto: LoginDto) {
    let accountType: 'admin' | 'user' = 'admin';
    let user: any = await this.adminsService.findByEmail(loginDto.email);
    
    if (!user) {
      user = await this.usersService.findByEmail(loginDto.email);
      accountType = 'user';
    }

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
      type: accountType,
    };

    if (accountType === 'admin') {
      await this.adminsService.update(user.id, { lastLogin: new Date() } as any);
    } else {
      await this.usersService.update(user.id, { lastLogin: new Date() } as any);
    }

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
}
