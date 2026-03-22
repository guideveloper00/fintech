import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtPayload, AuthUserResponse } from './types/auth.types';
import {
  COOKIE_ACCESS_TOKEN,
  ACCESS_TOKEN_TTL_MS,
} from '../common/constants/cookies.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
    res: Response,
  ): Promise<AuthUserResponse> {
    const user = await this.usersService.create(name, email, password);
    this.setAuthCookie(res, user);
    return user;
  }

  async login(
    email: string,
    password: string,
    res: Response,
  ): Promise<AuthUserResponse> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Credenciais inválidas');

    this.setAuthCookie(res, user);
    return user;
  }

  logout(res: Response): void {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie(COOKIE_ACCESS_TOKEN, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'strict',
    });
  }

  // -------------------------------------------------------------------------

  private setAuthCookie(res: Response, user: User): void {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie(COOKIE_ACCESS_TOKEN, token, {
      httpOnly: true,
      secure: isProd,
      // sameSite 'none' is required when frontend and backend are on different
      // origins (e.g. two separate Vercel projects). Must be paired with secure:true.
      sameSite: isProd ? 'none' : 'strict',
      maxAge: ACCESS_TOKEN_TTL_MS,
      path: '/',
    });
  }
}
