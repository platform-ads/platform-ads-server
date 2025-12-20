import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class UserRoleEntity {
  @Expose()
  @Transform(({ value }: { value: unknown }) => value?.toString())
  _id: string;

  @Expose()
  name: string;
}

export class UserEntity {
  @Expose()
  @Transform(({ value }: { value: unknown }) => value?.toString())
  _id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Exclude()
  password: string;

  @Expose()
  @Type(() => UserRoleEntity)
  roles: UserRoleEntity[];

  @Expose()
  avatarUrl?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
