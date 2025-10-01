import pkg from "pg";
const { Pool } = pkg;

const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
    POSTGRES_HOST,
} = process.env;

export const pool = new Pool({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    port: 5432,
});

(async () => {
    try {
        const client = await pool.connect();
        console.log("✅ Connected to Postgres successfully");
        client.release();
    } catch (err) {
        console.error("❌ Postgres connection failed:", err);
    }
})();
