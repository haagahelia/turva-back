import { Router } from "express";
import { pool } from "../config/db";

const router = Router();

/**
 * @openapi
 * /api/world:
 *   get:
 *     summary: Returns all worlds
 *     description: Selects all from world and returns json
 *     tags:
 *       - Worlds
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Database query failed
 */

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM World;");
    res.json(result.rows);
  } catch (err) {
    console.error("Error in query:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

export default router;
