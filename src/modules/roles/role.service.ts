import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { RoleDocument } from './schema/role.schema';
import { PaginationOptions } from 'src/common/http';
import { paginateQuery } from 'src/common/utils/pagination.util';

@Injectable()
export class RoleService {
  constructor(
    @Inject('ROLE_MODEL')
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async findAll(paginationOptions: PaginationOptions) {
    return paginateQuery(this.roleModel, {}, paginationOptions, {
      sort: { createdAt: -1 },
    });
  }

  async findByName(name: string): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ name }).exec();
  }
}
