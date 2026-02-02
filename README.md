# NestJS GraphQL File Upload & Metrics API

A backend system built with NestJS, GraphQL, TypeORM, and PostgreSQL representing a File Upload & Metrics System.

## Features

- **Authentication**: Email/Password Signup & Login with JWT.
- **File Upload**: Streamed file uploads to MinIO (S3 compatible) with metadata storage in Postgres.
- **Metrics**: Per-user upload metrics (Total files, Storage used, Uploads per day).
- **Real-Time Updates**: GraphQL Subscriptions for file upload events.
- **Clean Architecture**: Modular design (Auth, Users, Files, Metrics).

## Tech Stack

- **Framework**: NestJS
- **API**: GraphQL (Code First)
- **Database**: PostgreSQL (via TypeORM)
- **Object Storage**: MinIO (S3 Compatible)
- **Language**: TypeScript

## Prerequisites

- Node.js (v18+)
- Docker (optional, if you want to run DB/MinIO via Docker)
- PostgreSQL instance
- MinIO instance (or S3)

## Setup

1.  **Clone the repository**
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Environment Variables**
    Copy `.env` (or create one) and configure your credentials:
    ```env
    DATABASE_URL=postgresql://user:password@localhost:5432/tact_db
    JWT_SECRET=super_secret
    MINIO_ENDPOINT=localhost
    MINIO_PORT=9000
    MINIO_ACCESS_KEY=minioadmin
    MINIO_SECRET_KEY=minioadmin
    MINIO_BUCKET=uploads
    MINIO_USE_SSL=false
    ```

## Running the App

```bash
# Development
npm run start:dev
```

The GraphQL Playground will be available at `http://localhost:3000/graphql`.

## GraphQL Operations

### Authentication
- `signup(signupInput: { email, password })`: Returns User + JWT.
- `login(loginInput: { email, password })`: Returns User + JWT.
- `me`: Returns current authenticated user.

### Files
- `uploadFile(file: Upload!)`: Uploads a file.
- `myFiles`: Lists all files for the current user.

### Metrics
- `myUploadMetrics`: Returns usage stats (total storage, count, history).

### Subscriptions
- `fileUploaded`: Notifies when a file is uploaded (Authenticated).

## Architecture Decisions

- **Modularity**: Separation of concerns into `Users`, `Auth`, `Files`, and `Metrics` modules.
- **Code First GraphQL**: Reduces boilerplate and keeps TypeScript types in sync with schema.
- **MinIO/S3**: generic storage handling.
- **TypeORM**: Used for easy database interaction and relation management.
- **JWT**: Stateless authentication.
