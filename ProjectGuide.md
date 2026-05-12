# PROJECT GUIDE

_Prepared by: GitHub Copilot (GPT-5.2-Codex)_

This guide is a handoff for developers who need to continue working on the Turva backend. It documents what is already implemented, where the data comes from, how the application is structured, and how clients are expected to interact with it based on current endpoints and data models.

## Table of Contents
- [1. Scope and Purpose](#1-scope-and-purpose)
- [2. What Exists Today](#2-what-exists-today)
- [3. Application Structure](#3-application-structure)
- [4. Startup and Runtime](#4-startup-and-runtime)
- [5. Data Sources and Models](#5-data-sources-and-models)
- [6. API Surface](#6-api-surface)
- [7. Authentication Flow](#7-authentication-flow)
- [8. Infrastructure in Repo](#8-infrastructure-in-repo)
- [9. Testing in Repo](#9-testing-in-repo)
- [10. Not Present in This Repo](#10-not-present-in-this-repo)
- [11. File Map (Key Files)](#11-file-map-key-files)

## 1. Scope and Purpose
- This is a backend repository for the TurvaOppi platform.
- Client applications are expected to consume the REST API endpoints defined here.
- The guide covers only current, verifiable code and configuration in this repository.

## 2. What Exists Today
**Primary backend responsibilities**
- Serve informational pages from `info`.
- Serve quiz content from `Quiz` and `World`.
- Track quiz completion and world completion per user.
- Provide world bonus calculations per user.
- Issue and verify physical reward codes.

**Technology stack**
- Node.js, TypeScript, Express
- PostgreSQL via `pg`
- JWT auth via `jsonwebtoken`
- OTP hashing via `bcryptjs`
- Email sending via `nodemailer` (Ethereal test SMTP)
- OpenAPI docs via `swagger-jsdoc` and `swagger-ui-express`

## 3. Application Structure
**High-level request flow**
```
Request
  -> CORS middleware
  -> JSON parser
  -> Express Router
  -> Route handler
  -> SQL via pg Pool
  -> Response
```

**Routing**
- The router is mounted at `/api` in [src/app.ts](src/app.ts).
- Route modules are aggregated in [src/routes/index.ts](src/routes/index.ts).

**Data access**
- All database calls are direct SQL queries using `pg.Pool` from [src/config/db.ts](src/config/db.ts).

## 4. Startup and Runtime
**Entry point**
- [src/index.ts](src/index.ts) loads env vars, connects to DB, creates the app, and starts the server on port `3000`.

**Swagger**
- If `ENABLE_SWAGGER=true`, Swagger UI is enabled at `/docs` (configured in [src/utils/swagger.ts](src/utils/swagger.ts)).

## 5. Data Sources and Models
**Schema source**
- All tables and seed data are defined in [sql/init.sql](sql/init.sql).

**Key tables used by the API**
- `info`
- `Organization`
- `TurvaUser`
- `World`
- `Quiz`
- `User_Completed_Quiz`
- `User_Completed_World`
- `CrisisTeam`
- `Physical_Reward`
- `email_otps`

**Relationships (textual)**
```
Organization (1) -> TurvaUser (N)
Organization (1) -> World (N)
World (1) -> Quiz (N)
TurvaUser (1) -> User_Completed_Quiz (N) -> Quiz (1)
TurvaUser (1) -> User_Completed_World (N) -> World (1)
TurvaUser (1) -> Physical_Reward (N)
Organization (1) -> CrisisTeam (N)
```

**Schema name alignment**
- `World` uses `world_name_fi` and `world_name_en` in the schema.
- `Quiz` uses `quiz_name_fi` and `quiz_name_en` in the schema.
- The current quiz routes and tests use `quiz_name` and some tests insert `world_name`.

## 6. API Surface
Base path: `/api`

**Info management**
- `GET /info`
- `GET /info/:id`
- `POST /info`
- `PUT /info/:id`
- `DELETE /info/:id`

**Quiz management**
- `GET /quiz`
- `GET /quiz/:id`
- `GET /quiz/world/:world_id/quizzes`
- `POST /quiz`
- `PUT /quiz/:id`
- `DELETE /quiz/:id`

**World and bonuses**
- `GET /world`
- `GET /world-bonus/user/:user_id`

**Crisis team management**
- `GET /crisis-team`
- `GET /crisis-team/:id`
- `POST /crisis-team`
- `PUT /crisis-team/:id`
- `DELETE /crisis-team/:id`

**User-facing data**
- `GET /user/profile` (JWT required)
- `GET /quiz-result/user/:user_id/stats`
- `GET /quiz-result/user/:user_id/history`

**Physical reward verification (QR scan use case)**
- `GET /physical-reward/verify/:code` returns HTML

Route implementations are in [src/routes](src/routes).

## 7. Authentication Flow
**OTP login flow**
1. `POST /api/auth/login` validates user and sends OTP email.
2. OTP is stored in `email_otps` as a bcrypt hash.
3. `POST /api/auth/verify` validates OTP and issues JWT.

**JWT usage**
- JWT is generated in [src/utils/tokenGenerator.ts](src/utils/tokenGenerator.ts).
- JWT is verified in [src/utils/verification.ts](src/utils/verification.ts).
- Auth checks are performed inside handlers, not as Express middleware.

## 8. Infrastructure in Repo
**Docker**
- [Dockerfile](Dockerfile) runs the dev server in a container.

**docker-compose**
- [docker-compose.yml](docker-compose.yml) runs app + Postgres and seeds data from [sql/init.sql](sql/init.sql).

**CI**
- Lint-only GitHub Actions workflow in [.github/workflows/ci_pipeline.yaml](.github/workflows/ci_pipeline.yaml).

## 9. Testing in Repo
**Frameworks**
- Jest and Supertest.

**Tests present**
- Info API tests in [tests/infoapi.test.ts](tests/infoapi.test.ts).
- Auth API tests in [tests/loginapi.test.ts](tests/loginapi.test.ts).
- Quiz API tests in [tests/quizapi.test.ts](tests/quizapi.test.ts).

## 10. Not Present in This Repo
- No ORM or migration tool. Schema is defined in [sql/init.sql](sql/init.sql).
- No service or repository layer; logic is inside route handlers.
- No explicit role-based access control or privileged-route guards.
- No background workers, queues, or scheduled jobs.
- No monitoring or tracing integration.

## 11. File Map (Key Files)
- Entry point: [src/index.ts](src/index.ts)
- App setup: [src/app.ts](src/app.ts)
- Routes index: [src/routes/index.ts](src/routes/index.ts)
- Auth routes: [src/routes/auth.ts](src/routes/auth.ts)
- Info routes: [src/routes/info.ts](src/routes/info.ts)
- Quiz routes: [src/routes/quiz.ts](src/routes/quiz.ts)
- Quiz result routes: [src/routes/quizResult.ts](src/routes/quizResult.ts)
- World routes: [src/routes/world.ts](src/routes/world.ts)
- World bonus routes: [src/routes/worldBonus.ts](src/routes/worldBonus.ts)
- Crisis team routes: [src/routes/crisisTeam.ts](src/routes/crisisTeam.ts)
- Physical reward routes: [src/routes/physicalReward.ts](src/routes/physicalReward.ts)
- DB config: [src/config/db.ts](src/config/db.ts)
- CORS config: [src/config/cors.ts](src/config/cors.ts)
- Auth helpers: [src/utils/verification.ts](src/utils/verification.ts)
- JWT helper: [src/utils/tokenGenerator.ts](src/utils/tokenGenerator.ts)
- Email helper: [src/utils/emailer.ts](src/utils/emailer.ts)
- Swagger config: [src/utils/swagger.ts](src/utils/swagger.ts)