import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import { UserSchema } from 'src/modules/users/schema/user.schema';
import { RoleSchema } from 'src/modules/roles/schema/role.schema';

type UserSeedData = {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: Array<{ _id: mongoose.Types.ObjectId; name: string }>;
  createdAt: Date;
  updatedAt: Date;
};

export function createAdminUserSeedData(
  configService: ConfigService,
): Omit<UserSeedData, 'roles'> | null {
  const username = configService.get<string>('ADMIN_USERNAME') ?? '';
  const email = configService.get<string>('ADMIN_EMAIL') ?? '';
  const phoneNumber = configService.get<string>('ADMIN_PHONE') ?? '';
  const password = configService.get<string>('ADMIN_PASSWORD') ?? '';

  if (!username || !email || !phoneNumber || !password) {
    return null;
  }

  return {
    username,
    email,
    phoneNumber,
    password,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function seedUsers(
  connection: typeof mongoose,
  configService: ConfigService,
) {
  const adminUser = createAdminUserSeedData(configService);
  if (!adminUser) {
    return;
  }

  const RoleModel = connection.model('Role', RoleSchema);
  const UserModel = connection.model('User', UserSchema);

  const adminRole = await RoleModel.findOne({ name: 'admin' });
  if (!adminRole) {
    throw new Error(
      'Missing required role in DB: admin. Run role seed first (seedRoles) or create the role manually.',
    );
  }

  const existing = await UserModel.exists({
    $or: [{ username: adminUser.username }, { email: adminUser.email }],
  });
  if (existing) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminUser.password, 10);

  await UserModel.create({
    ...adminUser,
    password: hashedPassword,
    roles: [{ _id: adminRole._id, name: adminRole.name }],
  });
}
