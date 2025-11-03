import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

/** 
 * @openapi
 * /api/info:
 *   get:
 *     summary: Returns all info pages
 *     description: Selects all from info, orders them by id and returns json
 *     tags:
 *       - Info Page
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Database query failed
*/

router.get("/", async (_req, res) => {
    try {
        const result = await pool.query("SELECT * FROM info ORDER BY id;");
        res.json(result.rows);
    } catch (err) {
        console.error("Error in query:", err);
        res.status(500).json({ error: "Database query failed" });
    }
});

/** 
 * @openapi
 * /api/info/{id}:
 *   get:
 *     summary: Get info page by ID
 *     description: Selects all from info where the ID matches the provided ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the info to get
 *     tags:
 *       - Info Page
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: ID not found
 *       '500':
 *         description: Database query failed
*/

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT * FROM info WHERE id = $1",
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
 * /api/info/{id}:
 *   delete:
 *     summary: Delete info page by ID
 *     description: Delete info page where the ID you give matches the ID of the info page you want to delete
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the info page you want to get
 *     tags:
 *       - Info Page
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: ID not found
 *       '500':
 *         description: Delete failed
*/

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM info WHERE id = $1 RETURNING *",
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

/** 
 * @openapi
 * /api/info:
 *   post:
 *     summary: Add new info to db
 *     description: Insert into info
 *     requestBody:
 *       description: title and content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Page Title
 *               content:
 *                 type: string
 *                 example: New page content
 *     tags:
 *       - Info Page
 *     responses:
 *       '201':
 *         description: Created
 *       '400':
 *         description: Title or content missing
 *       '500':
 *         description: Insert failed
*/

router.post("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(400).json({ error: "Title or content missing" });
            return;
        };
        const result = await pool.query(
            "INSERT INTO info (title, content) VALUES ($1, $2) RETURNING *",
            [title, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Insert failed", err);
        res.status(500).json({ error: "Insert failed" });
    }
});

/** 
 * @openapi
 * /api/info/{id}:
 *   put:
 *     summary: Update info
 *     description: Update info page where ID matches
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the info to update
 *     requestBody:
 *       description: title and content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Page Title
 *               content:
 *                 type: string
 *                 example: New page content
 *     tags:
 *       - Info Page
 *     responses:
 *       '201':
 *         description: Created
 *       '400':
 *         description: Title or content missing
 *       '500':
 *         description: Insert failed
*/

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(400).json({ error: "Title or content missing" });
            return;
        };
        const result = await pool.query(
            "UPDATE info SET title = $1, content = $2, created_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
            [title, content, id]
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

export default router;
