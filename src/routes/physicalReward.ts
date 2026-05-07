import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { verifyToken } from '../utils/verification';
import crypto from 'crypto';

const router: Router = Router();

const successHtml = (profileName: string) => `
<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Haalarimerkki lunastettu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f0fdf4;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      border-top: 6px solid #16a34a;
    }
    .emoji { font-size: 64px; margin-bottom: 16px; }
    .status { color: #16a34a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .title { color: #111; font-size: 22px; font-weight: 600; margin-bottom: 8px; }
    .name { color: #16a34a; font-size: 28px; font-weight: 700; margin-bottom: 24px; }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
    .date { color: #6b7280; font-size: 14px; }
    .badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 500; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">🎖️</div>
    <div class="status">✓ Vahvistettu</div>
    <div class="title">Anna haalarimerkki</div>
    <div class="name">${profileName}</div>
    <div class="divider"></div>
    <div class="date">${new Date().toLocaleDateString('fi-FI', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    <div class="badge">Kaikki maailmat suoritettu</div>
  </div>
</body>
</html>
`;

const alreadyClaimedHtml = (profileName: string, claimedAt: Date) => `
<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Koodi jo käytetty</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fef2f2;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      border-top: 6px solid #dc2626;
    }
    .emoji { font-size: 64px; margin-bottom: 16px; }
    .status { color: #dc2626; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .title { color: #111; font-size: 22px; font-weight: 600; margin-bottom: 8px; }
    .name { color: #dc2626; font-size: 28px; font-weight: 700; margin-bottom: 24px; }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
    .date { color: #6b7280; font-size: 14px; }
    .badge { display: inline-block; background: #fee2e2; color: #dc2626; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 500; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">❌</div>
    <div class="status">Virhe</div>
    <div class="title">Koodi on jo käytetty</div>
    <div class="name">${profileName}</div>
    <div class="divider"></div>
    <div class="date">Lunastettu: ${new Date(claimedAt).toLocaleDateString('fi-FI', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    <div class="badge">Haalarimerkki on jo annettu</div>
  </div>
</body>
</html>
`;

const notFoundHtml = () => `
<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Koodi ei löydy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fffbeb;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      border-top: 6px solid #d97706;
    }
    .emoji { font-size: 64px; margin-bottom: 16px; }
    .status { color: #d97706; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .title { color: #111; font-size: 22px; font-weight: 600; margin-bottom: 8px; }
    .badge { display: inline-block; background: #fef3c7; color: #d97706; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 500; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">⚠️</div>
    <div class="status">Virhe</div>
    <div class="title">Koodia ei löydy</div>
    <div class="badge">Tarkista koodi ja yritä uudelleen</div>
  </div>
</body>
</html>
`;

/**
 * @openapi
 * /api/physical-reward/claim:
 *   post:
 *     summary: Claim physical reward (haalarimerkki)
 *     description: Generates a unique one-time QR code if all worlds are completed.
 *     tags:
 *       - Physical Reward
 *     responses:
 *       '200':
 *         description: Reward code returned successfully
 *       '403':
 *         description: Not all worlds completed
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Database error
 */
router.post('/claim', async (req: Request, res: Response): Promise<void> => {
  try {
    const decoded = verifyToken(req, res);
    if (!decoded || typeof decoded !== 'object' || !('email' in decoded)) return;
    const email = (decoded as { email: string }).email;

    const userResult = await pool.query(
      'SELECT user_id FROM TurvaUser WHERE email_address = $1 AND deleted_at IS NULL',
      [email]
    );
    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const userId = userResult.rows[0].user_id;

    const totalWorldsResult = await pool.query('SELECT COUNT(*) as total FROM World');
    const totalWorlds = parseInt(totalWorldsResult.rows[0].total, 10);

    const completedResult = await pool.query(
      'SELECT COUNT(*) as completed FROM User_Completed_World WHERE user_id = $1',
      [userId]
    );
    const completedWorlds = parseInt(completedResult.rows[0].completed, 10);

    if (completedWorlds < totalWorlds || totalWorlds === 0) {
      res.status(403).json({ error: 'Not all worlds completed', completedWorlds, totalWorlds });
      return;
    }

    const existingReward = await pool.query(
      'SELECT reward_code, claimed_at FROM Physical_Reward WHERE user_id = $1',
      [userId]
    );

    if (existingReward.rows.length > 0) {
      const { reward_code, claimed_at } = existingReward.rows[0];
      if (claimed_at) {
        res.status(200).json({ alreadyClaimed: true, reward_code: null });
      } else {
        res.status(200).json({ alreadyClaimed: false, reward_code });
      }
      return;
    }

    const rewardCode = crypto.randomUUID();
    await pool.query(
      'INSERT INTO Physical_Reward (user_id, reward_code) VALUES ($1, $2)',
      [userId, rewardCode]
    );

    res.status(201).json({ alreadyClaimed: false, reward_code: rewardCode });
  } catch (err) {
    console.error('Error claiming reward:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * @openapi
 * /api/physical-reward/verify/{code}:
 *   get:
 *     summary: Verify and claim physical reward
 *     description: Verifies the QR code and marks it as claimed. Returns HTML page with result.
 *     tags:
 *       - Physical Reward
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: HTML page with result
 */
router.get('/verify/:code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      `SELECT pr.reward_id, pr.claimed_at, tu.profile_name
       FROM Physical_Reward pr
       JOIN TurvaUser tu ON pr.user_id = tu.user_id
       WHERE pr.reward_code = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      res.setHeader('Content-Type', 'text/html');
      res.status(404).send(notFoundHtml());
      return;
    }

    const { reward_id, claimed_at, profile_name } = result.rows[0];

    if (claimed_at) {
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(alreadyClaimedHtml(profile_name, claimed_at));
      return;
    }

    await pool.query(
      'UPDATE Physical_Reward SET claimed_at = CURRENT_TIMESTAMP WHERE reward_id = $1',
      [reward_id]
    );

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(successHtml(profile_name));
  } catch (err) {
    console.error('Error verifying reward:', err);
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(notFoundHtml());
  }
});

export default router;