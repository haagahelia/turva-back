import { generatePin } from "@/utils/pinGenerator";
import { Router } from "express";
import bcrypt from 'bcryptjs';
import { validateEmail, verifyPin, verifyUser } from "@/utils/verification";
import { pool } from "@/config/db";
import { generateToken } from "@/utils/tokenGenerator";
import { sendEmail } from "@/utils/emailer";

const router = Router();

// TODO?: Add email confirmation before completing register??
router.post("/register", async (req, res) => {
    const username = req.body.username;
    const userEmail = req.body.email;
    const organizationId = req.body.organizationId;
    if (!userEmail || !username || !organizationId) {
        return res.status(400).json({ error: "Required fields missing" });
    }
    const isValidEmail = validateEmail(userEmail);
    if (!isValidEmail) {
        return res.status(400).json({ error: "Wrong email address" })
    }
    const duplicateQuery = `SELECT profile_name FROM TurvaUser WHERE profile_name = $1`
    const results = await pool.query(duplicateQuery, [username]);

    if (results.rows.length != 0) {
        const { existing_profile_name } = results.rows[0];

        if (existing_profile_name) {
            const isDuplicate = await verifyUser(userEmail, existing_profile_name);
            if (isDuplicate) {
                return res.status(409).json({ error: "Email or username already in use" })
            }
        }
    }

    const registerQuery = `INSERT INTO TurvaUser (organization_id, profile_name, email_address) VALUES ($1, $2, $3)`;
    const values = [organizationId, username, userEmail];
    await pool.query(registerQuery, values);
    return res.status(201).json({ message: "Account created!" });
});

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
    const username = req.body.username;
    console.log("email: " + userEmail);
    if (!username) {
        return res.status(400).json({ error: "No username received" });
    }
    if (!userEmail) {
        return res.status(400).json({ error: "No email address received" });
    }
    const isValidEmail = validateEmail(userEmail);
    if (!isValidEmail) {
        return res.status(400).json({ error: "Email address is not valid" });
    }
    const verifyStatus = await verifyUser(userEmail, username);
    if (verifyStatus) {
        const oneTimePin = generatePin();
        const createdAt = new Date();
        const validUntil = new Date(createdAt.getTime() + 30 * 60 * 1000);
        const otpQuery = `INSERT INTO email_otps (email, otp_code, valid_until, created_at) VALUES ($1, $2, $3, $4)`;
        const hashedPin = await bcrypt.hash(oneTimePin, 12);
        const values = [userEmail, hashedPin, validUntil, createdAt];
        await pool.query(otpQuery, values);
        console.log(oneTimePin);
        await sendEmail(userEmail, oneTimePin);
        return res.status(200).json({ message: "Login email sent to " + userEmail });
    } else {
        return res.status(401).json({ error: "Invalid credentials" });
    }
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
    const username = req.body.username;
    const verificationCode = req.body.verificationCode;
    if (!verificationCode) {
        return res.status(400).json({ error: "No verification code received." });
    }

    const isVerified = await verifyPin(email, verificationCode);

    if (isVerified) {
        const token = generateToken(email, username);
        return res.status(200).json({
            message: "Login successful!",
            token: token
        });
    }
    return res.status(401).json({ error: "Code is invalid." })
});

export default router;
