import { Body, Controller, Post } from '@nestjs/common';

import { ResponseMessage } from '../../common/http/decorators';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login
  @Post('login')
  @ResponseMessage('Login successfully')
  login(@Body() loginDto: LoginDto) {
    return this.authService.validateUser(loginDto);
  }

  // register
  @Post('register')
  @ResponseMessage('Registration successful')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.newUserRegister(registerDto);
  }
}
