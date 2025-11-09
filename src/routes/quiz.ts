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

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT * FROM quiz WHERE quiz_id = $1",
            [id]
        );
        if (result.rowCount === 0) {
            res.status(404).json({ error: "ID not found" });
            return;
        };
        res.json(result.rows);
    } catch (err) {
        console.error("Error in query:", err);
        res.status(500).json({ error: "Database query failed" });
    }
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const { world_id, quiz_name, quiz_content, order_number } = req.body;
        if (!world_id || !quiz_name || !order_number) {
            res.status(400).json({ error: "World id, quiz name or order number missing" });
            return;
        };
        const result = await pool.query(
            "INSERT INTO quiz (world_id, quiz_name, quiz_content, order_number) VALUES ($1, $2, $3, $4) RETURNING *",
            [world_id, quiz_name, quiz_content, order_number]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Insert failed", err);
        res.status(500).json({ error: "Insert failed" });
    }
});

export default router;
