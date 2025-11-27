import { generatePin } from "@/utils/pinGenerator";
import { Router } from "express";
import bcrypt from 'bcryptjs';
import { validateEmail, verifyPin } from "@/utils/verification";
import { pool } from "@/config/db";
import { generateToken } from "@/utils/tokenGenerator";
import { sendEmail } from "@/utils/emailer";

const router = Router();

/** 
 * @openapi
 * /api/auth/login/:
 *   post:
 *     summary: Email based login
 *     description: Sends a code to provided email address that is used for login and also saves it to database
 *     requestBody:
 *       description: User email
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@school.fi
 *     tags:
 *       - Login
 *     responses:
 *       '200':
 *         description: Email sent
 *       '400':
 *         description: No email received or not valid
*/

router.post("/login", async (req, res) => {
    const userEmail = req.body.email;
    if (!userEmail) {
        return res.status(400).json("No email address received");
    }
    const isValidEmail = validateEmail(userEmail);
    if (!isValidEmail) {
        return res.status(400).json("Email address is not valid");
    }
    const oneTimePin = generatePin();
    const createdAt = new Date();
    const validUntil = new Date(createdAt.getTime() + 30 * 60 * 1000);
    const otpQuery = `INSERT INTO email_otps (email, otp_code, valid_until, created_at) VALUES ($1, $2, $3, $4)`;
    const hashedPin = await bcrypt.hash(oneTimePin, 10);
    const values = [userEmail, hashedPin, validUntil, createdAt];
    await pool.query(otpQuery, values);
    console.log(oneTimePin);
    await sendEmail(userEmail, oneTimePin);
    return res.status(200).json("Login email sent to " + userEmail);
});

/** 
 * @openapi
 * /api/auth/verify:
 *   post:
 *     summary: Login token
 *     description: Send the varification code from email login to get a JWT token and login. Will check if code and email match
 *     requestBody:
 *       description: Verification code
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@school.fi
 *               verificationCode:
 *                 type: string
 *                 example: code
 *     tags:
 *       - Login
 *     responses:
 *       '200':
 *         description: Login successful
 *       '400':
 *         description: No verification code received
 *       '401':
 *         description: Code is invalid
*/

router.post("/verify", async (req, res) => {
    const email = req.body.email;
    const verificationCode = req.body.verificationCode;
    if (!verificationCode) {
        return res.status(400).json("No verification code received.");
    }

    const isVerified = await verifyPin(email, verificationCode);

    if (isVerified) {
        const token = generateToken(email);
        return res.status(200).json({
            message: "Login successful!",
            token: token
        });
    }
    return res.status(401).json("Code is invalid.")
});

export default router;
