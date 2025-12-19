import { Inject, Injectable } from '@nestjs/common';
import type { Model } from 'mongoose';

import { ROLE_MODEL } from './constants/role.constants';
import { RoleDocument } from './schema/role.schema';
import { paginateQuery } from '../../common/utils/pagination.util';
import type { PaginationOptions } from '../../common/http/response.types';

@Injectable()
export class RoleService {
  constructor(
    @Inject(ROLE_MODEL)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async findAll(paginationOptions: PaginationOptions) {
    return paginateQuery(this.roleModel, {}, paginationOptions, {
      sort: { createdAt: -1 },
    });
  }
}
