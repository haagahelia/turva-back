import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

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

router.post("/info", async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            res.status(400).json({ error: "Title or content missing" });
            return;
        }

        const result = await pool.query(
            "INSERT INTO info (title, content) VALUES ($1, $2) RETURNING *", [title, content]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Insert failed", err);
        res.status(500).json({ error: "Insert failed" });
    }
});

router.put("/info/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        if (!title || !content) {
            res.status(400).json({ error: "Title or content missing" });
            return;
        }

        const result = await pool.query(
            "UPDATE info SET title = $1, content = $2, created_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *", [title, content, id]
        );

        if (result.rowCount === 0) {
            res.status(400).json({ error: "ID not found" });
            return;
        }

        res.json({ message: "Updated successfully", updated: result.rows[0] });
    } catch (err) {
        console.error("Update failed:", err);
        res.status(500).json({ error: "Update failed" });
    }

});

export default router;