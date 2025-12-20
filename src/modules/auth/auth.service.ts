import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';

import { UserService } from '../users/user.service';
import { RoleService } from '../roles/role.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseEntity } from './entities/auth.entity';

@Injectable()
export class AuthService {
  private readonly refreshTokenOptions: JwtSignOptions;

  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTokenOptions = {
      expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
    } as JwtSignOptions;
  }

  comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async signIn(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const userDoc = await this.userService.findByEmail(email);

    if (!userDoc) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.comparePasswords(
      password,
      userDoc.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: userDoc._id.toString(), email: userDoc.email };

    const accessToken = await this.jwtService.signAsync({
      ...payload,
      type: 'access',
    });

    const refreshToken = await this.jwtService.signAsync(
      {
        ...payload,
        type: 'refresh',
      },
      this.refreshTokenOptions,
    );

    return plainToInstance(
      LoginResponseEntity,
      { accessToken, refreshToken },
      { excludeExtraneousValues: true },
    );
  }

  async signUp(registerDto: RegisterDto) {
    const { email, password, phoneNumber } = registerDto;

    const userName = email.split('@')[0];

    const roleDoc = await this.roleService.findByNameAsDocument('user');

    if (!roleDoc) {
      throw new UnauthorizedException('Role not found');
    }

    const [emailExists, usernameExists, phoneExists] = await Promise.all([
      this.userService.existsByEmail(email),
      this.userService.existsByUsername(userName),
      this.userService.existsByPhoneNumber(phoneNumber),
    ]);

    if (emailExists) {
      throw new UnauthorizedException('Email already in use');
    }

    if (usernameExists) {
      throw new UnauthorizedException('Username already in use');
    }

    if (phoneExists) {
      throw new UnauthorizedException('Phone number already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userService.create({
      username: userName,
      roles: [{ _id: roleDoc._id, name: roleDoc.name }],
      email,
      password: hashedPassword,
      phoneNumber,
    });

    if (!newUser) {
      throw new UnauthorizedException('Registration failed');
    }

    return newUser;
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        type: string;
      }>(token);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const userDoc = await this.userService.findByEmail(payload.email);

      if (!userDoc) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: userDoc._id.toString(),
        email: userDoc.email,
      };

      const accessToken = await this.jwtService.signAsync({
        ...newPayload,
        type: 'access',
      });

      const refreshToken = await this.jwtService.signAsync(
        {
          ...newPayload,
          type: 'refresh',
        },
        this.refreshTokenOptions,
      );

      return plainToInstance(
        LoginResponseEntity,
        { user: userDoc, accessToken, refreshToken },
        { excludeExtraneousValues: true },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
