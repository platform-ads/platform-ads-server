# Platform Ads Server - Copilot Instructions

## Project Overview
This is a **NestJS-based RESTful API** platform for advertising management, built with **TypeScript**, **MongoDB** (via Mongoose), and following modern backend development practices.

## Tech Stack
- **Framework**: NestJS 11.x
- **Runtime**: Node.js with TypeScript 5.7
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with @nestjs/jwt
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
│   ├── dto/                   # Data Transfer Objects
│   ├── entities/              # Response entities
│   ├── http/                  # HTTP layer (interceptors, filters, decorators)
│   └── utils/                 # Utility functions
├── config/                    # Configuration modules
│   └── database/              # Database configuration
├── database/                  # Database seeds and migrations
├── modules/                   # Feature modules
│   ├── auth/                  # Authentication module
│   ├── users/                 # User management module
│   └── roles/                 # Role management module
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
└── providers/                 # Database providers
```

## Coding Standards & Conventions

### 1. Database Layer
- **ORM**: Use Mongoose with custom schemas
- **Schema Pattern**: Define schemas in `schema/` directory using raw Mongoose schemas
- **Typing**: Create TypeScript types for documents extending mongoose.Document
- **Providers**: Use custom providers pattern for model injection

**Example Schema Structure:**
```typescript
// schema/user.schema.ts
export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  // ... other fields
}, { versionKey: false });

export type UserDocument = mongoose.Document & {
  username: string;
  email: string;
  // ... type definitions
};
```

### 2. Entity Layer (Response DTOs)
- **Location**: Place in `entities/` directory
- **Naming**: End with `Entity` suffix (e.g., `UserEntity`)
- **Serialization**: Use `class-transformer` decorators extensively
- **Patterns**:
  - Use `@Expose()` to explicitly expose fields
  - Use `@Exclude()` to hide sensitive data (passwords, etc.)
  - Use `@Transform()` for ObjectId to string conversion
  - Use `@Type()` for nested objects

**Example Entity:**
```typescript
export class UserEntity {
  @Expose()
  @Transform(({ value }) => value?.toString())
  _id: string;

  @Expose()
  username: string;

  @Exclude()
  password: string;

  @Expose()
  @Type(() => UserRoleEntity)
  roles: UserRoleEntity[];
}
```

### 3. DTO Layer (Request DTOs)
- **Location**: Place in `dto/` directory
- **Validation**: Use `class-validator` decorators
- **Transformation**: Use `class-transformer` for automatic type conversion
- **Patterns**:
  - Use `@Expose()` for all fields
  - Apply comprehensive validation rules
  - Include meaningful error messages

**Example DTO:**
```typescript
export class LoginDto {
  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Expose()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, {
    message: 'password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
  })
  password: string;
}
```

### 4. Service Layer
- **Responsibility**: Handle business logic and data access
- **Pattern**: Inject models using custom providers
- **Return Types**: Always return Entity objects from public methods
- **Transformation**: Use `plainToInstance()` to convert documents to entities
- **Error Handling**: Let NestJS handle exceptions naturally

**Example Service:**
```typescript
@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) return null;
    
    return plainToInstance(UserEntity, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}
```

### 5. Controller Layer
- **Responsibility**: Handle HTTP requests and responses
- **Decorators**: Always use `@ResponseMessage()` for success messages
- **Validation**: Rely on ValidationPipe for automatic DTO validation
- **Patterns**:
  - Use method-specific HTTP decorators (`@Get()`, `@Post()`, etc.)
  - Apply validation decorators at parameter level when needed
  - Keep controllers thin - delegate to services

**Example Controller:**
```typescript
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ResponseMessage('Users retrieved successfully')
  getUsers(@Query() paginationQuery: PaginationQueryDto) {
    return this.userService.findAll(paginationQuery);
  }
}
```

### 6. Response Standardization
- **Global Interceptor**: `ResponseInterceptor` wraps all responses in standard format
- **Standard Format**:
  ```typescript
  {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
  }
  ```
- **Custom Messages**: Use `@ResponseMessage()` decorator
- **Error Handling**: `HttpExceptionFilter` handles errors uniformly

### 7. Pagination
- **Standard DTO**: Use `PaginationQueryDto` for all paginated endpoints
- **Utility Function**: Use `paginateQuery()` helper for database queries
- **Response Format**: Return `PaginatedResponseEntity<T>` with meta information
- **Constants**: 
  - Default page: 1
  - Default limit: 10
  - Max limit: 100

## Module Development Guidelines

### 1. Creating New Modules
1. **Generate Structure**: Follow the established module pattern
2. **Database Schema**: Create in `schema/` directory with proper TypeScript types
3. **Providers**: Set up database providers for dependency injection
4. **Entities**: Create response entities with proper serialization
5. **DTOs**: Create request DTOs with validation rules
6. **Service**: Implement business logic with proper error handling
7. **Controller**: Create HTTP endpoints with proper decorators
8. **Module**: Wire everything together and export

### 2. Database Operations
- **Create Operations**: Always hash passwords, validate uniqueness
- **Read Operations**: Use entities for public API responses
- **Update Operations**: Validate changes and handle partial updates
- **Delete Operations**: Consider soft deletes for audit trails
- **Queries**: Use proper indexing and optimize for performance

### 3. Authentication & Authorization
- **JWT Strategy**: Use @nestjs/jwt for token management
- **Password Security**: Always use bcrypt for hashing
- **Validation**: Implement strong password requirements
- **Refresh Tokens**: Implement proper token refresh mechanism

### 4. Error Handling
- **Global Filter**: `HttpExceptionFilter` handles all exceptions
- **Standard Errors**: Use NestJS built-in HTTP exceptions
- **Error Messages**: Provide clear, user-friendly messages
- **Validation Errors**: Let class-validator handle input validation

### 5. Configuration
- **Environment**: Use `@nestjs/config` for all configuration
- **Global Config**: Make config module global in root module
- **Type Safety**: Create interfaces for configuration objects

## Development Best Practices

### 1. Code Quality
- **ESLint**: Follow configured rules strictly
- **Prettier**: Use for consistent code formatting
- **TypeScript**: Enable strict mode settings
- **Imports**: Use absolute imports when possible

### 2. Testing Strategy
- **Note**: Currently no test runner configured
- **Future**: Plan to implement Jest-based testing

### 3. Security
- **CORS**: Configured for development (localhost:3000)
- **Validation**: Global ValidationPipe with strict options
- **Headers**: Proper security headers configuration
- **Passwords**: Never expose in API responses

### 4. Performance
- **Database**: Use proper indexing and query optimization
- **Serialization**: Use class-transformer for efficient object transformation
- **Pagination**: Implement for all list endpoints
- **Caching**: Consider implementing caching strategy for frequent queries

## Common Commands

```bash
# Development
npm run start:dev          # Start in watch mode
npm run build             # Build for production
npm run start:prod        # Run production build

# Database
npm run seed              # Run database seeds

# Code Quality
npm run lint              # Run ESLint
npm run format            # Run Prettier
```

## Environment Variables
Ensure these are properly configured in `.env`:
- `PORT`: Application port (default: 3000)
- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- Other module-specific configurations

## When Adding New Features

1. **Plan the Module**: Understand the domain and relationships
2. **Design Schema**: Create efficient database schema
3. **Create Entities**: Design proper API response structure
4. **Validate Input**: Create comprehensive DTOs with validation
5. **Implement Logic**: Write clean, testable service methods
6. **Create Endpoints**: Design RESTful API endpoints
7. **Test Manually**: Use tools like Postman for testing
8. **Document**: Update this file if adding new patterns

Remember: **Consistency is key**. Follow the established patterns and conventions to maintain code quality and developer experience.
