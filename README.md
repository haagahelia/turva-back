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
