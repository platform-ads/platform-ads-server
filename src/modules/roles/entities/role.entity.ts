import { Expose, Transform } from 'class-transformer';

export class RoleTransform {
  @Expose()
  @Transform(({ value }: { value: unknown }) => value?.toString())
  _id: string;

  @Expose()
  name: string;
}

export class RoleEntity {
  @Expose()
  @Transform(({ value }: { value: unknown }) => value?.toString())
  _id: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<RoleEntity>) {
    Object.assign(this, partial);
  }
}
