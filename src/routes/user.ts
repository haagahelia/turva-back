import { Router, Request, Response } from "express";
import { pool } from "@/config/db";
import { verifyToken } from "@/utils/verification";

const router: Router = Router();

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     summary: Get user profile info
 *     description: Returns profile name and picture URL
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 *       '401':
 *         description: Unauthorized, no token or invalid token
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Database query failed
 */

router.get("/profile", async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const decoded = verifyToken(req, res);

    if (!decoded || typeof decoded !== "object" || !('email' in decoded)) {
      return;
    }

    const email = (decoded as { email: string }).email;
    const query = `
      SELECT user_id, profile_name, profile_picture_url, email_address
      FROM TurvaUser
      WHERE email_address = $1
        AND deleted_at IS NULL
    `;

    const result = await pool.query(query, [email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    return res.status(200).json({
      userId: user.user_id,
      profileName: user.profile_name,
      profilePictureUrl: user.profile_picture_url,
      email: user.email_address,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return res.status(500).json({ error: "Database query failed" });
  }
});

export default router;
