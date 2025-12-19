import type { Mongoose } from 'mongoose';

import { RoleSchema } from 'src/modules/role/schema/role.schema';
import { DATABASE_CONNECTION } from 'src/config/database/database.constants';
import { ROLE_MODEL } from '../constants/role.constants';

export const roleProviders = [
  {
    provide: ROLE_MODEL,
    useFactory: (mongooseInstance: Mongoose) =>
      mongooseInstance.model('Role', RoleSchema),
    inject: [DATABASE_CONNECTION],
  },
];
