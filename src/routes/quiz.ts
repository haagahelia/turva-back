import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

/**
 * @openapi
 * /api/quiz:
 *   get:
 *     summary: Returns all quizzes
 *     description: Selects all from quiz and returns json
 *     tags:
 *       - Quiz
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Database query failed
 */

router.get("/", async (_req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Quiz;");
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

/**
 * @openapi
 * /api/quiz/world/{world_id}/quizzes:
 *   get:
 *     summary: Get quizzes by world ID
 *     description: Selects all from quiz where the world ID matches the provided world ID
 *     parameters:
 *       - in: path
 *         name: world_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the world whose quizzes you want
 *     tags:
 *       - Quiz
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: ID not found
 *       '500':
 *         description: Database query failed
 */

router.get("/world/:world_id/quizzes", async (req: Request, res: Response): Promise<void> => {
    try {
        const { world_id } = req.params;
        const result = await pool.query(
            "SELECT * FROM quiz WHERE world_id = $1",
            [world_id]
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

/** 
 * @openapi
 * /api/quiz:
 *   post:
 *     summary: Add new quiz to db
 *     description: Insert into quiz
 *     requestBody:
 *       description: title and content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               world_id:
 *                 type: integer
 *                 example: 1
 *               quiz_name:
 *                 type: string
 *                 example: New Quiz
 *               order_number:
 *                 type: integer
 *                 example: 1
 *     tags:
 *       - Quiz
 *     responses:
 *       '201':
 *         description: Created
 *       '400':
 *         description: world_id, quiz_name or order_number missing
 *       '500':
 *         description: Insert failed
*/

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

/** 
 * @openapi
 * /api/quiz/{id}:
 *   put:
 *     summary: Update Quiz content
 *     description: Update quiz content for quiz where ID matches
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the quiz to update
 *     requestBody:
 *       description: quiz content json 
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *             example: Paste the JSON in here!
 *     tags:
 *       - Quiz
 *     responses:
 *       '201':
 *         description: Created
 *       '500':
 *         description: Insert failed
*/

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE Quiz SET quiz_content = $1, created_at = CURRENT_TIMESTAMP WHERE quiz_id = $2 RETURNING *",
            [req.body, id]
        );
        if (result.rowCount === 0) {
            res.status(400).json({ error: "ID not found" });
            return;
        };
        res.json({ message: "Updated successfully", updated: result.rows[0] });
    } catch (err) {
        console.error("Update failed:", err);
        res.status(500).json({ error: "Update failed" });
    }
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM quiz WHERE quiz_id = $1 RETURNING *",
            [id]
        );
        if (result.rowCount === 0) {
            res.status(404).json({ error: "ID not found" });
            return;
        };
        res.json({ message: "Deleted successfully", deleted: result.rows[0] });
    } catch (err) {
        console.error("Delete failed", err);
        res.status(500).json({ error: "Delete failed" });
    }
});

export default router;
