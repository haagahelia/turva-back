import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        const result = await pool.query("SELECT * FROM quiz ORDER BY quiz_id;");
        res.json(result.rows);
    } catch (err) {
        console.error("Error in query:", err);
        res.status(500).json({ error: "Database query failed" });
    }
});

export default router;
