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

- `npm run dev` - Run the server in development mode
- `npm run build` - Compile the server to `build/`
- `npm start` - Run the compiled server
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint

### Tech Stack

Developed with NestJS, TypeScript, and Node.js. The API is served under `/api`.
