import { Router, Request, Response } from "express";
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

router.delete("/info/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM info WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ error: "ID not found" });
            return;
        }

        res.json({ message: "Deleted successfully", deleted: result.rows[0] })
    } catch (err) {
        console.error("Delete failed", err);
        res.status(500).json({ error: "Delete failed" });
    }
});

export default router;
