import { generatePin } from "@/utils/pinGenerator";
import { Router } from "express";
import bcrypt from 'bcryptjs';
import { validateEmail, verifyPin } from "@/utils/verification";
import { pool } from "@/config/db";
import { generateToken } from "@/utils/tokenGenerator";
import { sendEmail } from "@/utils/emailer";

const router = Router();

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
    pool.query(otpQuery, values);
    console.log(oneTimePin);
    sendEmail(userEmail, oneTimePin);
    return res.status(200).json("Login email sent to " + userEmail);
});

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