import { Exclude, Expose } from 'class-transformer';

/**
 * Base response entity cho tất cả API responses
 */
export class BaseResponseEntity<T> {
  @Expose()
  success: boolean;

  @Expose()
  statusCode: number;

  @Expose()
  message: string;

  @Expose()
  data: T;

  @Expose()
  timestamp: string;

  constructor(partial: Partial<BaseResponseEntity<T>>) {
    Object.assign(this, partial);
    this.success = true;
    this.timestamp = new Date().toISOString();
  }
}
