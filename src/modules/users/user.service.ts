import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { UserDocument } from './schema/user.schema';
import { PaginationOptions } from 'src/common/http';
import { paginateQuery } from 'src/common/utils/pagination.util';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(paginationOptions: PaginationOptions) {
    return paginateQuery(this.userModel, {}, paginationOptions, {
      sort: { createdAt: -1 },
      select: '-password',
    });
  }

  async findByid(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec();
  }
}
