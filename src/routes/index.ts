import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/ping", (_req, res) => {
    res.send("pong")
});

router.get("/", (_req, res) => {
    res.json("Hello world!")
});

router.get("/info", async (_req, res) => {
    try {
        const result = await pool.query("SELECT * FROM info ORDER BY id;");
        res.json(result.rows);
    } catch (err) {
        console.error("Error in query:", err);
        res.status(500).json({ error: "Database query failed" });

    }
});

export default router;
