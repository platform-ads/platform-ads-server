import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/config/database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RoleModule } from '../roles/role.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [DatabaseModule, RoleModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
