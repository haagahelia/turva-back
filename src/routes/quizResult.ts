import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { verifyToken } from '../utils/verification';

const router: Router = Router();

/**
 * @openapi
 * /api/quiz-result:
 *   post:
 *     summary: Save user's quiz result
 *     description: Saves the quiz result for a user. Gets userId from JWT token. Also checks if the world is completed and awards bonus if so.
 *     tags:
 *       - Quiz Result
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quiz_id
 *               - correct_answers
 *               - time_spent_seconds
 *             properties:
 *               quiz_id:
 *                 type: integer
 *                 example: 1
 *               correct_answers:
 *                 type: integer
 *                 example: 5
 *               time_spent_seconds:
 *                 type: integer
 *                 example: 120
 *     responses:
 *       '201':
 *         description: Result saved successfully
 *       '400':
 *         description: Missing required fields
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User or quiz not found
 *       '500':
 *         description: Database error
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { quiz_id, correct_answers, time_spent_seconds } = req.body;

    const decoded = verifyToken(req, res);
    if (!decoded || typeof decoded !== 'object' || !('email' in decoded)) return;
    const email = (decoded as { email: string }).email;
    
    if (!quiz_id || correct_answers === undefined || time_spent_seconds === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const userResult = await pool.query(
      'SELECT user_id FROM TurvaUser WHERE email_address = $1 AND deleted_at IS NULL',
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userId = userResult.rows[0].user_id;

    await pool.query(
      `INSERT INTO User_Completed_Quiz (user_id, quiz_id, score, time_spent_seconds)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, quiz_id) DO UPDATE
       score = EXCLUDED.score,
       time_spent_seconds = EXCLUDED.time_spent_seconds,
       completed_at = CURRENT_TIMESTAMP`,
      [userId, quiz_id, correct_answers, time_spent_seconds]
    );

    // Get world_id for the quiz
    const quizResult = await pool.query(
      'SELECT world_id FROM Quiz WHERE quiz_id = $1',
      [quiz_id]
    );

    if (quizResult.rows.length === 0) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    const worldId = quizResult.rows[0].world_id;

    // Check if all quizzes in this world are completed by this user with score >= 1
    const completionResult = await pool.query(
      `SELECT COUNT(*) as total,
      COUNT(ucq.quiz_id) as completed
      FROM Quiz q
      LEFT JOIN User_Completed_Quiz ucq
      ON q.quiz_id = ucq.quiz_id
      AND ucq.user_id = $1
      WHERE q.world_id = $2`,
      [userId, worldId]
    );

    const { total, completed } = completionResult.rows[0];
    const worldCompleted = parseInt(total) === parseInt(completed);
    let bonusAwarded = false;

    if (worldCompleted) {
      const bonusResult = await pool.query(
        `INSERT INTO User_Completed_World (user_id, world_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, world_id) DO NOTHING`,
        [userId, worldId]
      );
      bonusAwarded = (bonusResult.rowCount ?? 0) > 0;
    }

    res.status(201).json({ message: 'Result saved successfully', worldCompleted, bonusAwarded });
  } catch (err) {
    console.error('Error saving quiz result:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * @openapi
 * /api/quiz-result/user/{user_id}/stats:
 *   get:
 *     summary: Get user's quiz statistics
 *     description: Returns sum of score and total time spent for a user
 *     tags:
 *       - Quiz Result
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to get statistics for
 *     responses:
 *       '200':
 *         description: User quiz statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: integer
 *                   example: 15
 *                 totalTimeSeconds:
 *                   type: integer
 *                   example: 360
 *       '400':
 *         description: Invalid user ID
 *       '500':
 *         description: Database error
 */
router.get('/user/:user_id/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;

    if (typeof user_id !== 'string' || user_id.trim() === '' || Number.isNaN(Number(user_id))) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const result = await pool.query(
      `SELECT
         COALESCE(SUM(score), 0) AS points,
         COALESCE(SUM(time_spent_seconds), 0) AS total_time_seconds
       FROM User_Completed_Quiz
       WHERE user_id = $1`,
      [user_id]
    );

    const stats = result.rows[0];
    res.status(200).json({
      points: parseInt(stats.points, 10),
      totalTimeSeconds: parseInt(stats.total_time_seconds, 10),
    });
  } catch (err) {
    console.error('Error retrieving quiz statistics:', err);
    res.status(500).json({ error: 'Database error while retrieving statistics' });
  }
});

/**
 * @openapi
 * /api/quiz-result/user/{user_id}/history:
 *   get:
 *     summary: Get user's quiz history
 *     description: Returns list of completed quizzes with scores and time spent
 *     tags:
 *       - Quiz Result
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   quiz_id:
 *                     type: integer
 *                   quiz_name_fi:
 *                     type: string
 *                   quiz_name_en:
 *                     type: string
 *                   score:
 *                     type: integer
 *                   time_spent_seconds:
 *                     type: integer
 *                   completed_at:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Database error
 */
router.get('/user/:user_id/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;

    if (typeof user_id !== 'string' || user_id.trim() === '' || Number.isNaN(Number(user_id))) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const result = await pool.query(
      `SELECT 
         uc.quiz_id,
         q.quiz_name_fi,
         q.quiz_name_en,
         uc.score,
         uc.time_spent_seconds,
         uc.completed_at
       FROM User_Completed_Quiz uc
       JOIN Quiz q ON uc.quiz_id = q.quiz_id
       WHERE uc.user_id = $1
       ORDER BY uc.completed_at DESC`,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching quiz history:', err);
    res.status(500).json({ error: 'Database error while fetching history' });
  }
});

export default router;