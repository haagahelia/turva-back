import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router: Router = Router();

/**
 * @openapi
 * /api/world-bonus/user/{user_id}:
 *   get:
 *     summary: Get user world bonus points
 *     description: Returns the number of completed worlds and total bonus points for a user
 *     tags:
 *       - World Bonus
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     responses:
 *       '200':
 *         description: World bonus data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completedWorlds:
 *                   type: integer
 *                   example: 1
 *                 bonusPoints:
 *                   type: integer
 *                   example: 10
 *       '400':
 *         description: Invalid user ID
 *       '500':
 *         description: Database error
 */
router.get('/user/:user_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;

    if (typeof user_id !== 'string' || user_id.trim() === '' || Number.isNaN(Number(user_id))) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const result = await pool.query(
      `SELECT COUNT(*) as completed_worlds
       FROM User_Completed_World
       WHERE user_id = $1`,
      [user_id]
    );

    const completedWorlds = parseInt(result.rows[0].completed_worlds, 10);
    const bonusPoints = completedWorlds * 10; // 10 points per completed world

    res.status(200).json({ completedWorlds, bonusPoints });
  } catch (err) {
    console.error('Error fetching world bonus:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;