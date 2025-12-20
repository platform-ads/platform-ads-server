import { Controller, Get, Query } from '@nestjs/common';
import { ResponseMessage } from 'src/common/http';

import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ResponseMessage('Users retrieved successfully')
  getUsers(@Query() paginationQuery: PaginationQueryDto) {
    return this.userService.findAll(paginationQuery);
  }

  @Get('by-id')
  @ResponseMessage('User retrieved successfully')
  getUserById(@Query('id') id: string) {
    return this.userService.findByid(id);
  }
}
