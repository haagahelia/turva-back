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
existing database, run the migration from a terminal opened at the repository
root. For a database reachable with `psql`, set `DATABASE_URL` to that
database's connection string and run:

```powershell
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f sql/migrations/001_add_user_role.sql
```

For the local Docker database, run this from the repository root instead
(change `postgres` if your `.env` uses a different database user or name):

```powershell
docker compose exec -T postgres psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/migrations/001_add_user_role.sql
```

For the Rahti test database, set `DATABASE_URL` to its test-database connection
string and use the `psql` command above. In Bash, use `"$DATABASE_URL"` instead
of `"$env:DATABASE_URL"`. Keep database credentials out of source control and
shared documentation.

After the user has registered, run the following SQL **in a `psql` session
connected to the target database**. For local Docker, open that session from a
terminal at the repository root with:

```powershell
docker compose exec -it postgres psql -U postgres -d postgres
```

For Rahti, open the session from a terminal with:

```powershell
psql "$env:DATABASE_URL"
```

Then paste this SQL at the `psql` prompt:

```sql
UPDATE TurvaUser
SET role = 'admin'
WHERE email_address = 'admin@example.com'
  AND deleted_at IS NULL
RETURNING user_id, email_address, role;
```

Replace the example address with the intended account and verify the returned
row. The role migration is safe to re-run. In Bash, use `"$DATABASE_URL"` in
the Rahti `psql` command instead of `"$env:DATABASE_URL"`.

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
