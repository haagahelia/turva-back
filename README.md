# turva-back

Backend API server for the TurvaOppi

## Documentation

- Project guide: [ProjectGuide.md](ProjectGuide.md)

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- npm
- [Docker](https://docs.docker.com/)

### Installation with Docker

1. Clone the repository

   ```bash
   git clone https://github.com/haagahelia/turva-back.git
   cd turva-back
   ```

2. Set environmental variables

   ```bash
   cp .env.example .env
   ```

3. Build and run the project

   ```bash
   docker compose up
   ```

### Existing databases: role migration and admin access

Fresh databases created with `sql/init.sql` include the `role` column. For an
existing database, run the migration once from the repository root. It is safe
to re-run.

Local Docker database (uses the user and database name from your `.env`):

```bash
docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < sql/migrations/001_add_user_role.sql
```

Rahti test database: it is only reachable inside the Rahti project, not from
your computer, so run `psql` inside its pod with `oc` (after `oc login` and
`oc project <your-project>`):

```bash
oc exec -i deployment/turva-test-db -- sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRESQL_USER" -d "$POSTGRESQL_DATABASE"' < sql/migrations/001_add_user_role.sql
```

To make a user admin, the user must have registered first. Open a `psql`
session on the target database:

```bash
# Local Docker
docker compose exec -it postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'

# Rahti test database
oc exec -it deployment/turva-test-db -- sh -c 'psql -U "$POSTGRESQL_USER" -d "$POSTGRESQL_DATABASE"'
```

Then run this SQL at the `psql` prompt:

```sql
UPDATE TurvaUser
SET role = 'admin'
WHERE email_address = 'admin@example.com'
  AND deleted_at IS NULL
RETURNING user_id, email_address, role;
```

Replace the example address with the intended account and check that one row is
returned.

### Running the tests

The tests are integration tests: they create, update and delete rows in a real
PostgreSQL database. **Always use a separate local test database, never the
Rahti one.**

1. Start a throwaway database seeded with `sql/init.sql`:

   ```bash
   docker run -d --name turva-back-testdb -p 5432:5432 \
     -e POSTGRES_USER=turva -e POSTGRES_PASSWORD=test -e POSTGRES_DB=turva_test \
     -v "$(pwd)/sql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro" \
     postgres:16-alpine
   ```

   The app always connects on port 5432, so stop any other local PostgreSQL
   (e.g. `docker compose down`) first.

2. Create `.env.test` (it is git-ignored, like `.env`):

   ```bash
   cp .env.example .env.test
   ```

   and set `POSTGRES_USER=turva`, `POSTGRES_PASSWORD=test`,
   `POSTGRES_DB=turva_test`, `POSTGRES_HOST=127.0.0.1`, any `JWT_SECRET`, and
   `TEST_DOMAIN=turva.back.fi`.

3. Run the tests:

   ```bash
   npm test
   ```

Remove the database afterwards with `docker rm -f turva-back-testdb`.

### Available Scripts

- `npm run dev` or `npm run start:dev` - Run the NestJS CLI in watch mode
- `npm run build` - Build the application with the NestJS CLI to `dist/`
- `npm run start` - Build and start the application
- `npm run start:prod` - Run the compiled application
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint

The Husky pre-commit hook formats staged JavaScript, TypeScript, JSON, Markdown, and YAML files with Prettier.

### Tech Stack

Developed with NestJS, TypeScript, and Node.js. The API is served under `/api`.

### Deployment

The CD workflow builds and deploys the `main` and `feature/csc-rahti-cd` branches
to CSC Rahti. The feature branch trigger is intended for pipeline debugging and
testing. Configure the GitHub Actions secrets `CSC_PROJECT` and `CSC_TOKEN` for
the target Rahti project and its access token.

Add these additional GitHub Actions secrets to the `dev` environment:
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST`,
`JWT_SECRET`, and `TEST_DOMAIN`. During deployment, the workflow uses these
values to create or update the `turva-back-secrets` secret in Rahti; no manual
Rahti secret setup is needed. The database must be reachable from the Rahti
project. Swagger is disabled in the deployed container.

The workflow caches npm packages, the version-pinned Rahti CLI, and Docker
build layers between runs.

### Development test database

The separate **Deploy test database** workflow is run on demand from the
Actions tab (`workflow_dispatch`). It deploys a PostgreSQL service named
`turva-test-db` in the same Rahti project, stores database files on a 1 GiB
persistent volume, and initializes an empty database with `sql/init.sql`.
It uses `CSC_PROJECT`, `CSC_TOKEN`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and
`POSTGRES_DB` from the `dev` GitHub Actions environment.

To connect the backend to this database, set the `POSTGRES_HOST` secret in the
`dev` environment to `turva-test-db`, then run the regular CD workflow so the
backend deployment receives the updated secret. The initialization script is
run only when the database schema is absent; rerunning the workflow does not
reset or reseed existing database data.
