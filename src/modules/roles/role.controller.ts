import { Controller, Get, Query } from '@nestjs/common';

import { RoleService } from './role.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ResponseMessage } from '../../common/http/decorators';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ResponseMessage('Roles retrieved successfully')
  getRoles(@Query() paginationQuery: PaginationQueryDto) {
    return this.roleService.findAll(paginationQuery);
  }

  @Get('by-name')
  @ResponseMessage('Role retrieved successfully')
  getRoleByName(@Query('name') name: string) {
    return this.roleService.findByName(name);
  }
}
