# BACKEND DOCUMENTATION
_Prepared by: GitHub Copilot (GPT-5.2-Codex)_

## Table of Contents
- [1. Project Overview](#1-project-overview)
- [2. Project Structure](#2-project-structure)
- [3. Application Architecture](#3-application-architecture)
- [4. Startup Flow](#4-startup-flow)
- [5. Modules Documentation](#5-modules-documentation)
- [6. File-by-File Documentation](#6-file-by-file-documentation)
- [7. API Documentation](#7-api-documentation)
- [8. Database Documentation](#8-database-documentation)
- [9. Authentication & Authorization](#9-authentication--authorization)
- [10. Environment Variables](#10-environment-variables)
- [11. Dependencies](#11-dependencies)
- [12. Infrastructure](#12-infrastructure)
- [13. Testing](#13-testing)
- [14. Technical Notes](#14-technical-notes)

## 1. Project Overview
**Backend purpose**
- REST API server for TurvaOppi.

**Business domain**
- Learning platform with informational content, quizzes, and reward logic.

**Main responsibilities**
- Serve info pages and quiz content.
- Register users and authenticate using email OTP and JWT.
- Track quiz completion and world completion per user.
- Calculate bonus points for completed worlds.
- Issue and verify a one-time physical reward code.

**Technologies used**
- Node.js, TypeScript
- Express
- PostgreSQL
- JWT
- bcrypt
- Nodemailer (Ethereal)
- Swagger (OpenAPI)
- Jest + Supertest
- Docker + docker-compose

**Architecture style**
- Route-centric Express application.
- Direct SQL queries through `pg` pool.
- No ORM, no service/repository abstraction layers.

**Frameworks/libraries currently used**
- express, pg, jsonwebtoken, bcryptjs, nodemailer, swagger-jsdoc, swagger-ui-express, cors

---

## 2. Project Structure
```
/
  docker-compose.yml
  Dockerfile
  eslint.config.mjs
  jest.config.ts
  jest.setup.ts
  LICENSE
  package.json
  package-lock.json
  README.md
  tsconfig.json
  .env.example
  .github/
    workflows/
      ci_pipeline.yaml
  sql/
    init.sql
  src/
    app.ts
    index.ts
    config/
      cors.ts
      db.ts
    routes/
      auth.ts
      crisisTeam.ts
      index.ts
      info.ts
      physicalReward.ts
      quiz.ts
      quizResult.ts
      user.ts
      world.ts
      worldBonus.ts
    utils/
      emailer.ts
      pinGenerator.ts
      swagger.ts
      tokenGenerator.ts
      verification.ts
  tests/
    infoapi.test.ts
    loginapi.test.ts
    quizapi.test.ts
```

**/src**
- Contains the application source code.
- `index.ts` bootstraps the server.
- `app.ts` creates and configures the Express app.
- `/routes` defines the HTTP endpoints.
- `/config` holds configuration for database and CORS.
- `/utils` contains reusable helpers for auth, email, and Swagger.

**/sql**
- PostgreSQL schema and seed data in `init.sql`.

**/tests**
- Jest + Supertest integration tests.

**/.github/workflows**
- CI workflow for linting.

**Root files**
- Build, test, lint, and container definitions.

---

## 3. Application Architecture
**Layers**
- HTTP layer: Express routes in `src/routes`.
- Data access: Direct SQL via `pg` pool in `src/config/db.ts`.

**Module organization**
- Modules are implemented as Express routers grouped by feature.
- No explicit service or repository classes.

**Request flow**
```
Request
  -> CORS middleware
  -> JSON body parser
  -> Express router
  -> Route handler
  -> SQL query (pg Pool)
  -> Response
```

**Dependency injection**
- Not present. Modules import shared utilities and the DB pool directly.

**Communication between modules**
- Shared utilities (`verification.ts`, `tokenGenerator.ts`, etc.).
- Shared DB pool (`db.ts`).

**Service structure**
- No services. Business logic is inside route handlers.

**Repository structure**
- No repositories. SQL statements are embedded in route handlers.

---

## 4. Startup Flow
1. `src/index.ts` loads environment variables using `dotenv`.
2. `connectDB()` from `src/config/db.ts` checks PostgreSQL connectivity.
3. `createApp()` from `src/app.ts` builds the Express app.
4. Middleware is registered: CORS and JSON body parser.
5. Router is mounted at `/api`.
6. Server listens on port `3000`.
7. Swagger docs are enabled when `ENABLE_SWAGGER=true`.

No worker, cron, or background job initialization is present.

---

## 5. Modules Documentation
### Auth Module (`src/routes/auth.ts`)
**Purpose**
- Email OTP login and JWT issuance.

**Responsibilities**
- Register user.
- Send OTP to email.
- Verify OTP and issue JWT.

**Structure**
- Express router with `POST /register`, `POST /login`, `POST /verify`.

**Dependencies**
- `pg` pool
- `bcryptjs`
- `generatePin`, `verifyPin`, `verifyUser`, `validateEmail`, `generateToken`, `sendEmail`

**Integrations**
- SMTP via Nodemailer Ethereal test account.

---

### Info Module (`src/routes/info.ts`)
**Purpose**
- CRUD for info pages.

**Responsibilities**
- List, get, create, update, delete info items.

**Structure**
- Express router with `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

**Dependencies**
- `pg` pool

---

### Quiz Module (`src/routes/quiz.ts`)
**Purpose**
- Quiz retrieval and management.

**Responsibilities**
- List quizzes.
- Get quiz by ID.
- Get quizzes by world ID.
- Create, update, delete quizzes.

**Dependencies**
- `pg` pool

---

### Quiz Result Module (`src/routes/quizResult.ts`)
**Purpose**
- Persist quiz results and compute world completion.

**Responsibilities**
- Save quiz results for a user.
- Compute world completion and bonus.
- Fetch user quiz statistics and history.

**Dependencies**
- `pg` pool
- `verifyToken`

---

### World Module (`src/routes/world.ts`)
**Purpose**
- Retrieve worlds.

**Responsibilities**
- `GET /` returns all worlds.

**Dependencies**
- `pg` pool

---

### World Bonus Module (`src/routes/worldBonus.ts`)
**Purpose**
- Calculate world completion bonuses.

**Responsibilities**
- Return number of completed worlds and bonus points for a user.

**Dependencies**
- `pg` pool

---

### User Module (`src/routes/user.ts`)
**Purpose**
- Retrieve user profile data.

**Responsibilities**
- `GET /profile` returns user profile by JWT.

**Dependencies**
- `pg` pool
- `verifyToken`

---

### Crisis Team Module (`src/routes/crisisTeam.ts`)
**Purpose**
- Manage crisis contact entries.

**Responsibilities**
- List, get, create, update, soft delete contacts.

**Dependencies**
- `pg` pool

---

### Physical Reward Module (`src/routes/physicalReward.ts`)
**Purpose**
- Issue and verify reward codes.

**Responsibilities**
- `POST /claim` generates a reward code if all worlds completed.
- `GET /verify/:code` verifies and marks reward claimed.

**Dependencies**
- `pg` pool
- `verifyToken`
- `crypto`

---

## 6. File-by-File Documentation

### src/index.ts
**Purpose**
- Server entry point.

**Responsibilities**
- Load env vars, connect DB, create app, start server, optionally enable Swagger.

**Dependencies**
- `dotenv`, `createApp`, `connectDB`, `swaggerDocs`.

**Used By**
- `npm run dev`, `npm start`.

**Key Logic**
- Calls `connectDB()` before creating app.
- Starts server on port 3000.

---

### src/app.ts
**Purpose**
- Express app factory.

**Responsibilities**
- Configure CORS, JSON parser, mount `/api` routes.

**Dependencies**
- `express`, `cors`, `corsOptions`, `routes`.

**Used By**
- `src/index.ts`, tests.

**Key Logic**
- `app.use("/api", routes)`.

---

### src/routes/index.ts
**Purpose**
- Route aggregator.

**Responsibilities**
- Defines `/ping` and `/` and mounts feature routers.

**Dependencies**
- `express.Router` and module routers.

**Used By**
- `src/app.ts`.

---

### src/config/db.ts
**Purpose**
- PostgreSQL pool setup.

**Responsibilities**
- Export `pool` and `connectDB()`.

**Dependencies**
- `pg`.

**Used By**
- All routes and utilities needing database access.

---

### src/config/cors.ts
**Purpose**
- CORS configuration object.

**Responsibilities**
- Define allowed origins, methods, headers, and credentials.

**Used By**
- `src/app.ts`.

---

### src/utils/tokenGenerator.ts
**Purpose**
- JWT creation.

**Responsibilities**
- Create signed JWT with `email` and `username`.

**Dependencies**
- `jsonwebtoken`.

**Used By**
- `src/routes/auth.ts`.

---

### src/utils/pinGenerator.ts
**Purpose**
- Generate numeric OTP.

**Responsibilities**
- Produce a 6-digit random code.

**Dependencies**
- `crypto`.

**Used By**
- `src/routes/auth.ts`.

---

### src/utils/emailer.ts
**Purpose**
- Send OTP emails.

**Responsibilities**
- Create Ethereal test account and send email.

**Dependencies**
- `nodemailer`.

**Used By**
- `src/routes/auth.ts`.

---

### src/utils/swagger.ts
**Purpose**
- Swagger/OpenAPI documentation setup.

**Responsibilities**
- Generate OpenAPI spec and expose `/docs` UI.

**Dependencies**
- `swagger-jsdoc`, `swagger-ui-express`.

**Used By**
- `src/index.ts`.

---

### src/utils/verification.ts
**Purpose**
- Auth and OTP validation helpers.

**Responsibilities**
- Verify JWT, validate email, verify OTP, verify user.

**Dependencies**
- `jsonwebtoken`, `bcryptjs`, `pg`.

**Used By**
- `src/routes/auth.ts`, `src/routes/quizResult.ts`, `src/routes/user.ts`, `src/routes/physicalReward.ts`.

---

### src/routes/auth.ts
**Purpose**
- Auth endpoints (register, login, verify).

**Responsibilities**
- Insert user records.
- Generate and email OTP.
- Verify OTP and issue JWT.

**Dependencies**
- `pg`, `bcryptjs`, `utils/*`.

**Used By**
- Client login flow.

---

### src/routes/info.ts
**Purpose**
- Info CRUD.

**Responsibilities**
- `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

**Dependencies**
- `pg`.

---

### src/routes/quiz.ts
**Purpose**
- Quiz CRUD and lookup.

**Responsibilities**
- `GET /`, `GET /:id`, `GET /world/:world_id/quizzes`, `POST /`, `PUT /:id`, `DELETE /:id`.

**Dependencies**
- `pg`.

---

### src/routes/quizResult.ts
**Purpose**
- Save quiz results and stats.

**Responsibilities**
- Insert/update quiz result.
- Determine world completion.
- Return stats/history.

**Dependencies**
- `pg`, `verifyToken`.

---

### src/routes/world.ts
**Purpose**
- Worlds listing.

**Responsibilities**
- `GET /` returns all rows from `World`.

**Dependencies**
- `pg`.

---

### src/routes/worldBonus.ts
**Purpose**
- World bonus points.

**Responsibilities**
- Count completed worlds and return bonus points.

**Dependencies**
- `pg`.

---

### src/routes/user.ts
**Purpose**
- User profile retrieval.

**Responsibilities**
- `GET /profile` uses JWT email to fetch user.

**Dependencies**
- `pg`, `verifyToken`.

---

### src/routes/crisisTeam.ts
**Purpose**
- Crisis team contact management.

**Responsibilities**
- List, get, create, update, soft delete contacts.

**Dependencies**
- `pg`.

---

### src/routes/physicalReward.ts
**Purpose**
- Physical reward claim and verification.

**Responsibilities**
- Create reward code if all worlds completed.
- Verify reward code and mark claimed.
- Return HTML response for verification.

**Dependencies**
- `pg`, `verifyToken`, `crypto`.

---

### tests/infoapi.test.ts
**Purpose**
- Integration tests for `/api/info`.

**Responsibilities**
- Validates CRUD responses and DB persistence.

**Dependencies**
- `jest`, `supertest`, `pg`.

---

### tests/loginapi.test.ts
**Purpose**
- Integration tests for auth endpoints.

**Responsibilities**
- Login and verify OTP flows.

**Dependencies**
- `jest`, `supertest`, `pg`.

---

### tests/quizapi.test.ts
**Purpose**
- Integration tests for quiz endpoints.

**Responsibilities**
- Validate quiz CRUD and lookup responses.

**Dependencies**
- `jest`, `supertest`, `pg`.

---

### sql/init.sql
**Purpose**
- Database schema and seed data.

**Responsibilities**
- Create all tables and insert initial data.

---

### docker-compose.yml
**Purpose**
- Define app and PostgreSQL services.

**Responsibilities**
- Build app image and configure DB with healthcheck and init SQL.

---

### Dockerfile
**Purpose**
- Build app container image.

**Responsibilities**
- Install dependencies and run dev server.

---

### jest.config.ts / jest.setup.ts
**Purpose**
- Configure Jest and env variables.

---

### eslint.config.mjs
**Purpose**
- Define linting configuration.

---

### tsconfig.json
**Purpose**
- TypeScript compiler configuration.

---

### package.json
**Purpose**
- Scripts and dependencies.

---

### .github/workflows/ci_pipeline.yaml
**Purpose**
- CI lint workflow.

---

## 7. API Documentation
Base path: `/api`

### Health
- `GET /api/ping`
  - Auth: none
  - Response: plain text `pong`

- `GET /api/`
  - Auth: none
  - Response: JSON string `"Hello world!"`

---

### Auth
- `POST /api/auth/register`
  - Auth: none
  - Request body:
    ```json
    {
      "username": "string",
      "email": "string",
      "organizationId": 1
    }
    ```
  - Response: 201
    ```json
    {"message":"Account created!"}
    ```
  - DB: `INSERT INTO TurvaUser`

- `POST /api/auth/login`
  - Auth: none
  - Request body:
    ```json
    {
      "email": "user@domain",
      "username": "profile_name"
    }
    ```
  - Response: 200
    ```json
    {"message":"Login email sent to user@domain"}
    ```
  - DB: `INSERT INTO email_otps`

- `POST /api/auth/verify`
  - Auth: none
  - Request body:
    ```json
    {
      "email": "user@domain",
      "username": "profile_name",
      "verificationCode": "123456"
    }
    ```
  - Response: 200
    ```json
    {"message":"Login successful!","token":"<jwt>"}
    ```

---

### Info
- `GET /api/info`
  - Auth: none
  - Response: array of info rows
    ```json
    [{"id":1,"title":"Title 1","content":"Content 1","created_at":"timestamp"}]
    ```
  - DB: `SELECT * FROM info ORDER BY id`

- `GET /api/info/:id`
  - Auth: none
  - Response: single row

- `POST /api/info`
  - Auth: none
  - Request body:
    ```json
    {"title":"string","content":"string"}
    ```
  - Response: created row

- `PUT /api/info/:id`
  - Auth: none
  - Request body:
    ```json
    {"title":"string","content":"string"}
    ```
  - Response: updated row

- `DELETE /api/info/:id`
  - Auth: none
  - Response:
    ```json
    {"message":"Deleted successfully","deleted":{...}}
    ```

---

### Quiz
- `GET /api/quiz`
- `GET /api/quiz/:id`
- `GET /api/quiz/world/:world_id/quizzes`
- `POST /api/quiz`
  - Request body:
    ```json
    {
      "world_id": 1,
      "quiz_name": "string",
      "quiz_content": {},
      "order_number": 1
    }
    ```
- `PUT /api/quiz/:id`
  - Request body: any JSON
- `DELETE /api/quiz/:id`

All quiz endpoints are unauthenticated and use direct SQL queries to `Quiz`.

---

### Quiz Result
- `POST /api/quiz-result`
  - Auth: Bearer JWT
  - Request body:
    ```json
    {"quiz_id":1,"correct_answers":5,"time_spent_seconds":120}
    ```
  - Response:
    ```json
    {"message":"Result saved successfully","worldCompleted":true,"bonusAwarded":false}
    ```
  - DB: `User_Completed_Quiz`, `User_Completed_World`

- `GET /api/quiz-result/user/:user_id/stats`
  - Auth: none
  - Response:
    ```json
    {"points":15,"totalTimeSeconds":360}
    ```

- `GET /api/quiz-result/user/:user_id/history`
  - Auth: none
  - Response: array of quiz history

---

### World
- `GET /api/world`
  - Auth: none
  - Response: array of worlds

---

### World Bonus
- `GET /api/world-bonus/user/:user_id`
  - Auth: none
  - Response:
    ```json
    {"completedWorlds":1,"bonusPoints":10}
    ```

---

### User
- `GET /api/user/profile`
  - Auth: Bearer JWT
  - Response:
    ```json
    {"userId":1,"profileName":"name","profilePictureUrl":null,"email":"user@domain"}
    ```

---

### Crisis Team
- `GET /api/crisis-team`
- `GET /api/crisis-team/:id`
- `POST /api/crisis-team`
- `PUT /api/crisis-team/:id`
- `DELETE /api/crisis-team/:id`

All crisis team endpoints are unauthenticated. Soft delete sets `deleted_at`.

---

### Physical Reward
- `POST /api/physical-reward/claim`
  - Auth: Bearer JWT
  - Response:
    ```json
    {"alreadyClaimed":false,"reward_code":"uuid"}
    ```
- `GET /api/physical-reward/verify/:code`
  - Auth: none
  - Response: HTML page indicating status.

---

## 8. Database Documentation
**Database**: PostgreSQL

**ORM usage**
- None. All queries are raw SQL.

**Tables and relationships**
- `info(id, title, content, created_at)`
- `email_otps(otp_id, email, otp_code, valid_until, created_at)`
- `Organization(organization_id, organization_name, logo_url, homepage_url, created_at, deleted_at)`
- `TurvaUser(user_id, organization_id, profile_name, email_address, profile_picture_url, created_at, deleted_at)`
- `AppPage(page_id, organization_id, page_name, page_content, created_at, deleted_at)`
- `World(world_id, organization_id, world_name_fi, world_name_en, order_number, created_at, deleted_at)`
- `Quiz(quiz_id, world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number, created_at, deleted_at)`
- `User_Completed_Quiz(user_id, quiz_id, score, time_spent_seconds, completed_at)`
- `CrisisTeam(contact_id, organization_id, name_fi, name_en, role_fi, role_en, phone, order_number, created_at, deleted_at)`
- `User_Completed_World(user_id, world_id, completed_at)`
- `Physical_Reward(reward_id, user_id, reward_code, claimed_at, created_at)`

**Constraints**
- Primary keys on all tables.
- `TurvaUser.profile_name` is unique.
- `Physical_Reward.reward_code` is unique.
- Foreign keys from users, worlds, quizzes, crisis team, and junction tables to their parents.

**Indexes**
- Only primary keys and unique constraints as defined in schema.

**Transactions**
- No explicit transactions are used in the code.

**Textual ERD**
```
Organization (1) -> TurvaUser (N)
Organization (1) -> World (N)
Organization (1) -> AppPage (N)
Organization (1) -> CrisisTeam (N)
World (1) -> Quiz (N)
TurvaUser (1) -> User_Completed_Quiz (N) -> Quiz (1)
TurvaUser (1) -> User_Completed_World (N) -> World (1)
TurvaUser (1) -> Physical_Reward (N)
```

**Migrations**
- Not present. Schema is managed by `sql/init.sql`.

---

## 9. Authentication & Authorization
**JWT handling**
- JWT token created in `src/utils/tokenGenerator.ts` and verified in `src/utils/verification.ts`.
- Token contains `email` and `username` and uses `JWT_SECRET`.

**OTP flow**
1. `POST /api/auth/login` generates a 6-digit PIN.
2. PIN is bcrypt-hashed and stored in `email_otps`.
3. PIN is sent using Nodemailer Ethereal test SMTP.
4. `POST /api/auth/verify` verifies PIN and issues JWT.

**Guards/middleware**
- No Express middleware guard exists. Auth is handled inside route handlers.

**Permissions/RBAC**
- None present.

---

## 10. Environment Variables
| Variable | Required | Used In | Purpose |
|---|---|---|---|
| POSTGRES_USER | Yes | src/config/db.ts | PostgreSQL user |
| POSTGRES_PASSWORD | Yes | src/config/db.ts | PostgreSQL password |
| POSTGRES_DB | Yes | src/config/db.ts | PostgreSQL database |
| POSTGRES_HOST | Yes | src/config/db.ts | PostgreSQL host |
| POSTGRES_PORT | No | Not used | Documented in .env.example |
| JWT_SECRET | Yes | src/utils/tokenGenerator.ts, src/utils/verification.ts | JWT signing secret |
| TEST_DOMAIN | No | src/utils/verification.ts | Restrict allowed email domain |
| ENABLE_SWAGGER | No | src/index.ts | Enable Swagger UI |

---

## 11. Dependencies
**Runtime dependencies**
- `express`: HTTP framework
- `pg`: PostgreSQL client
- `jsonwebtoken`: JWT signing/verification
- `bcryptjs`: hashing OTP codes
- `nodemailer`: email sending
- `cors`: CORS middleware
- `swagger-jsdoc`, `swagger-ui-express`: OpenAPI documentation
- `dotenv`: environment variables

**Development/testing dependencies**
- `typescript`, `ts-node-dev`, `ts-jest`, `jest`
- `eslint`, `@eslint/js`, `typescript-eslint`, `@stylistic/eslint-plugin`
- `supertest` (installed in dependencies)

---

## 12. Infrastructure
**Docker**
- `Dockerfile` runs `npm install` and starts `npm run dev`.

**docker-compose**
- `docker-compose.yml` defines `app` and `postgres` services.
- DB initialized via `sql/init.sql` mounted to `/docker-entrypoint-initdb.d`.

**CI/CD**
- `.github/workflows/ci_pipeline.yaml` runs `npm run lint` on push and PR to `main`.

**Logging**
- `console.log` and `console.error` used in routes and startup.

**Monitoring/Tracing**
- Not present.

---

## 13. Testing
**Frameworks**
- Jest and Supertest.

**Test structure**
- Integration tests in `tests/`:
  - `infoapi.test.ts`
  - `loginapi.test.ts`
  - `quizapi.test.ts`

**Coverage**
- Info endpoints: CRUD
- Auth endpoints: login and verify
- Quiz endpoints: CRUD and lookup

---

## 14. Technical Notes
- Auth is implemented via OTP + JWT and invoked directly in handlers rather than middleware.
- The API uses direct SQL queries without ORM.
- The Swagger docs use annotations inside route files.
- The reward verification endpoint returns HTML pages with inline styles.
- `sql/init.sql` contains both schema and seed data.
- The API exposes write endpoints without authentication for info, quiz, crisis team, and world bonus.
- `quiz` routes and tests use `quiz_name`, while the schema defines `quiz_name_fi` and `quiz_name_en`.
- `world` tests insert `world_name`, while the schema defines `world_name_fi` and `world_name_en`.
