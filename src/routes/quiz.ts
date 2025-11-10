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

/**
 * @openapi
 * /api/quiz/{world_id}:
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

router.get("/:world_id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { world_id } = req.params;
    const result = await pool.query("SELECT * FROM Quiz WHERE world_id = $1", [
      world_id,
    ]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "ID not found" });
      return;
    }
    res.json(result.rows);
  } catch (err) {
    console.error("Error in query:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

export default router;
