import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserService } from '../users/user.service';
import { RoleService } from '../roles/role.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async validateUser(loginDto: LoginDto) {
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

    return this.userService.findByEmailAsEntity(email);
  }

  async newUserRegister(registerDto: RegisterDto) {
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
}
