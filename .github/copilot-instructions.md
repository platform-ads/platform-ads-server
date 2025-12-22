# Platform Ads Server - Copilot Instructions

## Project Overview

This is a **NestJS-based RESTful API** platform for advertising management, built with **TypeScript**, **MongoDB** (via Mongoose), and following modern backend development practices.

## Tech Stack

- **Framework**: NestJS 11.x
- **Runtime**: Node.js with TypeScript 5.7
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with @nestjs/jwt & Passport
- **Validation**: class-validator & class-transformer
- **Security**: bcrypt for password hashing
- **Configuration**: @nestjs/config for environment management

## Architecture & Code Organization

### 1. Project Structure

```
src/
├── main.ts                     # Application bootstrap
├── app.module.ts               # Root application module
├── app.controller.ts           # Root controller
├── app.service.ts              # Root service
├── common/                     # Shared utilities and components
│   ├── dto/                   # Shared Data Transfer Objects (e.g., PaginationQueryDto)
│   ├── entities/              # Shared Response entities (e.g., PaginatedResponseEntity)
│   ├── http/                  # HTTP layer (interceptors, filters, decorators)
│   └── utils/                 # Utility functions (e.g., paginateQuery, providers)
├── config/                    # Configuration modules
│   └── database/              # Database configuration and constants
├── database/                  # Database seeds and migrations
└── modules/                   # Feature modules
    ├── auth/                  # Authentication module (guards, strategies)
    ├── users/                 # User management module
    └── roles/                 # Role management module
```

### 2. Module Structure Pattern

Each feature module follows this consistent structure:

```
module-name/
├── module-name.module.ts      # Module definition
├── module-name.controller.ts  # HTTP controllers
├── module-name.service.ts     # Business logic
├── dto/                       # Request/Response DTOs
├── entities/                  # Response entities
├── schema/                    # Database schemas
└── providers/                 # Database providers (model injection)
```

## Coding Standards & Conventions

### 1. Database Layer

- **ORM**: Use Mongoose with raw schemas.
- **Schema Pattern**: Define schemas in `schema/` directory.
- **Typing**: Create TypeScript types for documents extending `mongoose.Document`.
- **Providers**: Use `AppProvider` pattern for model injection, injecting `DATABASE_CONNECTION`.

**Example Schema:**
```typescript
// schema/user.schema.ts
export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  // ... fields
}, { versionKey: false });

export type UserDocument = mongoose.Document & {
  username: string;
  // ... types
};
```

**Example Provider:**
```typescript
// providers/user.provider.ts
export const userProviders: AppProvider[] = [{
  provide: 'USER_MODEL',
  useFactory: (mongooseInstance: Mongoose) => mongooseInstance.model('User', UserSchema),
  inject: [DATABASE_CONNECTION],
}];
```

### 2. Entity Layer (Response DTOs)

- **Location**: `entities/` directory.
- **Naming**: End with `Entity` suffix (e.g., `UserEntity`).
- **Serialization**: Use `class-transformer` decorators.
- **Patterns**:
  - Use `@Expose()` to explicitly expose fields.
  - Use `@Exclude()` for sensitive data.
  - **ObjectId Transformation**: Use the following pattern for `_id`:
    ```typescript
    @Expose()
    @Transform(({ obj }) => {
      const source = obj as { _id?: unknown; id?: unknown };
      const id = (source._id ?? source.id) as { toString(): string } | string | undefined;
      return id?.toString();
    })
    _id: string;
    ```

### 3. DTO Layer (Request DTOs)

- **Location**: `dto/` directory.
- **Validation**: Use `class-validator` decorators.
- **Transformation**: Use `class-transformer` for automatic type conversion.
- **Patterns**: Use `@Expose()` for all fields and apply comprehensive validation.

### 4. Service Layer

- **Responsibility**: Business logic and data access.
- **Pattern**: Inject models using `@Inject('MODEL_NAME')`.
- **Return Types**: Public methods should return Entity objects or `PaginatedResponseEntity`.
- **Transformation**: Use `plainToInstance(Entity, data, { excludeExtraneousValues: true })`.
- **Pagination**: Use `paginateQuery()` utility from `src/common/utils/pagination.util`.

### 5. Controller Layer

- **Responsibility**: HTTP request handling.
- **Decorators**: 
  - Always use `@ResponseMessage()` from `src/common/http`.
  - Use `@Roles()` and guards (`JwtAuthGuard`, `RolesGuard`) for protected routes.
- **Thin Controllers**: Delegate all business logic to services.

### 6. Response Standardization

- **Global Interceptor**: `ResponseInterceptor` wraps all responses.
- **Standard Format**: `{ success, statusCode, message, data, timestamp }`.
- **Pagination Format**: Returns `items` and `meta` (totalItems, itemCount, itemsPerPage, totalPages, currentPage).

## Development Best Practices

- **Imports**: Use absolute imports starting with `src/` (e.g., `src/common/http`, `src/modules/auth/guards/jwt-auth.guard`).
- **Consistency**: Follow existing patterns for `_id` transformation and model injection.
- **Error Handling**: Use NestJS built-in exceptions (e.g., `NotFoundException`, `BadRequestException`).
- **Security**: Never expose passwords; always use bcrypt for hashing.

## Common Commands

```bash
yarn start:dev          # Development mode
yarn seed              # Run database seeds
yarn lint              # Run ESLint
yarn format            # Run Prettier
```
