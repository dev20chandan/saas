import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

import { AdminsService } from '../admins/admins.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly adminsService: AdminsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'SuperSecretSchoolErpTokenKey2026!',
    });
  }

  async validate(payload: any) {
    let user;
    if (payload.type === 'admin') {
      user = await this.adminsService.findByEmail(payload.email);
    } else {
      user = await this.usersService.findByEmail(payload.email);
    }

    if (!user) {
      throw new UnauthorizedException('User not found or session expired');
    }
    if (user.status === 'Locked' || user.status === 'Inactive') {
      throw new UnauthorizedException('Your account is inactive or locked. Please contact support.');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
      school: user.schoolName,
      type: payload.type,
    };
  }
}
