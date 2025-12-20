import { SetMetadata, Type } from '@nestjs/common';
import { ClassTransformOptions } from 'class-transformer';

import { RESPONSE_MESSAGE_KEY, SKIP_TRANSFORM_KEY } from '../response.types';

/**
 * Custom decorator to set message for response
 * @example
 * @ResponseMessage('User created successfully')
 * @Post()
 * createUser() { ... }
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);

/**
 * Skip response transformation (returns raw data, but still applies serialization)
 * @example
 * @SkipTransform()
 * @Get('file')
 * downloadFile() { ... }
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);

/**
 * Decorator to define entity class for serialization
 * Use instead of returning entity instance from controller
 * @example
 * @Serialize(UserEntity)
 * @Get()
 * getUsers() { ... }
 */
export const SERIALIZE_KEY = 'serialize_entity';
export const Serialize = (entity: Type<any>) =>
  SetMetadata(SERIALIZE_KEY, entity);

/**
 * Decorator to customize serialization options
 * @example
 * @SerializeOptions({ excludePrefixes: ['_'] })
 * @Get()
 * getUsers() { ... }
 */
export const SERIALIZE_OPTIONS_KEY = 'serialize_options';
export const SerializeOptions = (options: ClassTransformOptions) =>
  SetMetadata(SERIALIZE_OPTIONS_KEY, options);
