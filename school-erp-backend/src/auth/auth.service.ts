import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
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
      sub: user._id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    };

    // Update lastLogin timestamp asynchronously
    user.lastLogin = new Date();
    await user.save();

    return {
      token: this.jwtService.sign(payload),
      role: user.role,
      schoolId: user.schoolId,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        school: user.school,
      },
    };
  }
}
