# Tact - NestJS GraphQL Metrics API

A production-grade backend system built with **NestJS**, **GraphQL**, **TypeORM**, and **PostgreSQL**. This application features secure authentication, scalable file uploads, real-time updates, and robust metrics aggregation.

## 🚀 Features

### Core Capabilities
- **Authentication**: Secure Email/Password SignUp & Login using `Passport` and `JWT` strategies.
- **File System**: Scalable file uploads to any S3-compatible storage (MinIO, AWS S3) via `graphql-upload-ts`.
- **Metrics Engine**: Aggregates user data (Total files, Storage usage, Daily upload history) via optimized SQL queries.
- **Real-Time**: GraphQL Subscriptions (`graphql-ws`) push immediate updates when files are uploaded.

### Architecture & Hardening
- **Modular Design**: Clean separation of concerns (Auth, Users, Files, Metrics).
- **Storage Abstraction**: Loose coupling via `IStorageProvider` interface—swap providers without touching business logic.
- **Config Validation**: Fails fast on startup if required environment variables are missing (using `Joi`).
- **Database Migrations**: Safe schema management with dedicated migration scripts (no `synchronize: true` in production).
- **Global Error Handling**: Standardized `AllExceptionsFilter` and `LoggingInterceptor` for consistent API behavior.
- **Security**: Request validation, typed DTOs, and protected resolvers using `GqlAuthGuard`.

---

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **API**: GraphQL (Code First approach)
- **Database**: PostgreSQL
- **ORM**: TypeORM (with Migrations enabled)
- **Object Storage**: MinIO / S3 (via custom Provider)
- **Validation**: Joi (Config) & Class-Validator (DTOs)
- **Testing**: Jest (Unit & E2E)

---

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- MinIO (or AWS S3 credentials)

### 1. Clone & Install
```bash
git clone https://github.com/chiefnaheem/graphqproject.git
cd tact
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tact_db

# Auth
JWT_SECRET=your_super_secret_key

# Object Storage (MinIO Example)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=uploads
MINIO_USE_SSL=false
```

### 3. Run Migrations
Initialize the database schema:
```bash
npm run migration:run
```

### 4. Start the Application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```
Access the **GraphQL Playground** at: `http://localhost:3000/graphql`

---

## 🧪 Testing

The project includes a comprehensive test suite covering both individual units and full end-to-end flows.

### Unit Tests
Tests service logic in isolation with mocked dependencies.
```bash
npm run test
```

### E2E Tests
Tests the full request lifecycle (HTTP -> Resolver -> DB).
*Note: Requires a running database.*
```bash
npm run test:e2e
```

---

## 📚 API Reference (GraphQL)

### Authentication
- `mutation signup($input: SignupInput!)`: Create account.
- `mutation login($input: LoginInput!)`: Get Access Token.
- `query me`: Get current user details (Protected).

### File Operations
- `mutation uploadFile($file: Upload!)`: Stream file to storage.
- `query myFiles`: List all uploaded files with metadata.

### Metrics & Real-Time
- `query myUploadMetrics`: Get aggregate stats (storage used, count, daily breakdown).
- `subscription fileUploaded`: Listen for new uploads in real-time.

---

## 🛡️ License

UNLICENSED
