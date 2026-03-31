import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router: Router = Router();

/** 
 * @openapi
 * /api/crisis-team:
 *   get:
 *     summary: Returns all crisis team contacts
 *     description: Selects all from CrisisTeam, orders them by order_number and returns json
 *     tags:
 *       - Crisis Team
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Database query failed
*/

router.get("/", async (_req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query("SELECT * FROM CrisisTeam WHERE deleted_at IS NULL ORDER BY order_number;");
        res.json(result.rows);
    } catch (err) {
        console.error("Error in query:", err);
        res.status(500).json({ error: "Database query failed" });
    }
});

/** 
 * @openapi
 * /api/crisis-team/{id}:
 *   get:
 *     summary: Get crisis team contact by ID
 *     description: Selects all from CrisisTeam where the ID matches the provided ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the contact to get
 *     tags:
 *       - Crisis Team
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Invalid ID format
 *       '404':
 *         description: ID not found
 *       '500':
 *         description: Database query failed
*/

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "Invalid ID format" });
            return;
        }

        const result = await pool.query(
            "SELECT * FROM CrisisTeam WHERE contact_id = $1 AND deleted_at IS NULL",
            [id]
        );
        if (result.rowCount === 0) {
            res.status(404).json({ error: "ID not found" });
            return;
        };
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error in query:", err);
        res.status(500).json({ error: "Database query failed" });
    }
});

/** 
 * @openapi
 * /api/crisis-team/{id}:
 *   delete:
 *     summary: Soft delete crisis team contact by ID
 *     description: Soft delete contact where the ID you give matches the ID of the contact you want to delete
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the contact you want to delete
 *     tags:
 *       - Crisis Team
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Invalid ID format
 *       '404':
 *         description: ID not found
 *       '500':
 *         description: Delete failed
*/

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "Invalid ID format" });
            return;
        }

        const result = await pool.query(
            "UPDATE CrisisTeam SET deleted_at = CURRENT_TIMESTAMP WHERE contact_id = $1 AND deleted_at IS NULL RETURNING *",
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
 * /api/crisis-team:
 *   post:
 *     summary: Add new crisis team contact to db
 *     description: Insert into CrisisTeam. order_number is assigned automatically as MAX + 1
 *     requestBody:
 *       description: organization_id, name_fi, name_en, role_fi, role_en, phone
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization_id
 *               - name_fi
 *               - name_en
 *               - role_fi
 *               - role_en
 *               - phone
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 example: 1
 *               name_fi:
 *                 type: string
 *                 example: "Teemu Kokko"
 *               name_en:
 *                 type: string
 *                 example: "Teemu Kokko"
 *               role_fi:
 *                 type: string
 *                 example: "Rehtori"
 *               role_en:
 *                 type: string
 *                 example: "Rector"
 *               phone:
 *                 type: string
 *                 example: "050 555 1131"
 *     tags:
 *       - Crisis Team
 *     responses:
 *       '201':
 *         description: Created
 *       '400':
 *         description: Missing required fields
 *       '500':
 *         description: Insert failed
*/

router.post("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const { organization_id, name_fi, name_en, role_fi, role_en, phone } = req.body;
        if (!organization_id || !name_fi || !name_en || !role_fi || !role_en || !phone) {
            res.status(400).json({ error: "organization_id, name_fi, name_en, role_fi, role_en, and phone are required" });
            return;
        };
        const result = await pool.query(
            `INSERT INTO CrisisTeam (organization_id, name_fi, name_en, role_fi, role_en, phone, order_number) 
             VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(MAX(order_number), 0) + 1 FROM CrisisTeam)) 
             RETURNING *`,
            [organization_id, name_fi, name_en, role_fi, role_en, phone]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Insert failed", err);
        res.status(500).json({ error: "Insert failed" });
    }
});

/** 
 * @openapi
 * /api/crisis-team/{id}:
 *   put:
 *     summary: Update crisis team contact
 *     description: Update contact where ID matches
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the contact to update
 *     requestBody:
 *       description: name_fi, name_en, role_fi, role_en, phone, order_number
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name_fi:
 *                 type: string
 *                 example: "Jane Doe"
 *               name_en:
 *                 type: string
 *                 example: "Jane Doe"
 *               role_fi:
 *                 type: string
 *                 example: "Uusi rooli"
 *               role_en:
 *                 type: string
 *                 example: "New Role"
 *               phone:
 *                 type: string
 *                 example: "050 123 4567"
 *     tags:
 *       - Crisis Team
 *     responses:
 *       '200':
 *         description: Updated successfully
 *       '400':
 *         description: Invalid ID format or missing required fields
 *       '404':
 *         description: ID not found
 *       '500':
 *         description: Update failed
*/

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "Invalid ID format" });
            return;
        }

        const { name_fi, name_en, role_fi, role_en, phone } = req.body;
        if (!name_fi || !name_en || !role_fi || !role_en || !phone) {
            res.status(400).json({ error: "name_fi, name_en, role_fi, role_en, and phone are required" });
            return;
        };
        const result = await pool.query(
            "UPDATE CrisisTeam SET name_fi = $1, name_en = $2, role_fi = $3, role_en = $4, phone = $5 WHERE contact_id = $6 AND deleted_at IS NULL RETURNING *",
            [name_fi, name_en, role_fi, role_en, phone, id]
        );
        if (result.rowCount === 0) {
            res.status(404).json({ error: "ID not found" });
            return;
        };
        res.json({ message: "Updated successfully", updated: result.rows[0] });
    } catch (err) {
        console.error("Update failed:", err);
        res.status(500).json({ error: "Update failed" });
    }
});

export default router;