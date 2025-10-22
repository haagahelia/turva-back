# turva-back

Backend API server for the TurvaApp

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm
- [Docker](https://docs.docker.com/) (optional)

### Installation

1. Clone the repository

    ```bash
    git clone https://github.com/haagahelia/turva-back.git
    cd turva-back
    ```

2. Install dependencies

    ```bash
    npm install
    ```

3. Run development server

    ```bash
    npm run dev
    ```

### Installation with Docker

1. Clone the repository

    ```bash
    git clone https://github.com/haagahelia/turva-back.git
    cd turva-back
    ```

2. Create a `.env` file (e.g. `vim .env` or `nano .env`)
and add the required values:

    ```bash
    POSTGRES_USER=
    POSTGRES_PASSWORD=
    POSTGRES_DB=
    POSTGRES_HOST=
    POSTGRES_PORT=
    ```

3. Build and run the project

    ```bash
    docker compose -f docker-compose-demo.yml up --build
    ```

### Tech Stack

Developed with TypeScript and Node
