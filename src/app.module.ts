import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoleModule } from './modules/roles/role.module';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdsModule } from './modules/ads/ads.module';
import { StorageModule } from 'src/modules/storage/storage.module';
import r2Config from 'src/config/storage/r2.config';
import { PointModule } from './modules/point/point.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [r2Config],
    }),

    RoleModule,
    UserModule,
    AuthModule,
    AdsModule,
    StorageModule,
    PointModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
