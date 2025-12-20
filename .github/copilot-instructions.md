# Platform Ads Server - Copilot Instructions

## Architecture Overview

This is a **NestJS + MongoDB** backend using Mongoose ODM for a platform advertising system with role-based authentication.

### Core Modules
- **Auth**: JWT-based authentication with access/refresh tokens (7-day refresh)
- **Users**: User management with embedded role objects (not references)
- **Roles**: Role management for RBAC

### Database Connection Pattern
- Uses **provider pattern** with `DATABASE_CONNECTION` constant injection
- Models registered via factory providers (see `user.provider.ts`, `role.providers.ts`)
- Connection configured in `database.providers.ts` with `MONGODB_URI` and `MONGODB_DB_NAME` env vars

```typescript
// Model provider pattern
provide: 'USER_MODEL',
useFactory: (mongooseInstance: Mongoose) => mongooseInstance.model('User', UserSchema),
inject: [DATABASE_CONNECTION]
```

## Response Architecture

All API responses are **automatically wrapped** by `ResponseInterceptor` extending `ClassSerializerInterceptor`:

```typescript
{
  success: true,
  statusCode: 200,
  message: "Data retrieved successfully",
  data: { ... },
  timestamp: "2025-12-20T..."
}
```

### Response Decorators
- `@ResponseMessage('Custom message')`: Override default success message
- `@SkipTransform()`: Return raw data (still serialized, but not wrapped)

### Entity Serialization
- All entities use `class-transformer` with `excludeExtraneousValues: true`
- Properties MUST be decorated with `@Expose()` to be included in responses
- Convert Mongoose docs to entities via `plainToInstance(Entity, data, { excludeExtraneousValues: true })`
- See `BaseResponseEntity` for response structure template

## Code Conventions

### Service Layer Pattern
Services have dual methods for different consumers:
- `findByEmail(email)`: Returns `UserDocument` (Mongoose document) for internal use
- `findByEmailAsEntity(email)`: Returns `UserEntity` (DTO) for API responses
- Use `existsByX()` methods for boolean checks (e.g., `existsByEmail()`, `existsByUsername()`)

### Schema Structure
- Schemas defined with plain Mongoose (not decorators): `new mongoose.Schema({...})`
- No versioning: `{ versionKey: false }`
- User roles embedded as array of `{ _id, name }` objects (not references)

### Module Organization
Each module follows this structure:
```
module/
├── module.controller.ts
├── module.service.ts
├── module.module.ts
├── dto/           # Input validation DTOs
├── entities/      # Output serialization entities
├── schema/        # Mongoose schemas
└── providers/     # Model providers
```

## Development Workflow

### Running the App
```bash
yarn start:dev  # Watch mode
yarn start      # Standard mode
```

### Database Seeding
```bash
yarn seed       # Seeds roles and admin user from .env
```
Seeds are run via `ts-node` with `tsconfig-paths/register` for path alias support.

### Environment Variables
Required in `.env`:
- `MONGODB_URI`, `MONGODB_DB_NAME`: Database connection
- `JWT_SECRET`, `JWT_EXPIRES_IN`: JWT configuration  
- `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_PHONE`: Admin seeding
- `PORT`: Server port (default: 8080)

### Global Configuration
- **Validation**: `ValidationPipe` with `transform: true`, `whitelist: true`, implicit conversion enabled
- **CORS**: Enabled for `http://localhost:3000` with credentials
- **Interceptors**: `ResponseInterceptor` (wraps responses)
- **Filters**: `HttpExceptionFilter` (error handling)

## Common Patterns

### Creating New Endpoints
1. Define DTOs with `class-validator` decorators for request validation
2. Create entities with `@Expose()` decorators for response serialization
3. Service methods return entities (use `plainToInstance()` for conversion)
4. Controllers can use `@ResponseMessage()` decorator for custom messages

### Pagination
- Use `PaginationOptions` type from `common/http`
- Use `paginateQuery()` utility (returns `{ items, meta }`)
- Wrap in `PaginatedResponseEntity<T>` for responses

### Authentication Flow
- `signIn()`: Returns `{ accessToken, refreshToken, user }`
- Passwords hashed with bcrypt (see `comparePasswords()`)
- JWT payloads include `{ sub: userId, email, type: 'access'|'refresh' }`
- Tokens configured via `@nestjs/jwt` module

## Important Notes

- **No test runner configured** - Jest was removed (`yarn test` will exit with error)
- Use Yarn for package management (not npm)
- ESLint uses flat config (`eslint.config.mjs`)
- TypeScript paths configured via `tsconfig-paths`
