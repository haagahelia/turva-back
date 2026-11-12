import pkg from "pg";
const { Pool } = pkg;

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PORT,
} = process.env;

export const pool: pkg.Pool = new Pool({
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT) || 5432,
});
